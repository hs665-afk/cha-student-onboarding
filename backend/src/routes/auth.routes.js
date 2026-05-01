const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../services/email/emailService');
const { protect, requireStepUp } = require('../middleware/auth');

// Google OAuth Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ providerId: profile.id, provider: 'google' });
      
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          provider: 'google',
          providerId: profile.id,
          avatar: profile.photos[0]?.value,
          role: 'student', // Default role for Google OAuth
          isVerified: true
        });
        
        // Send welcome email
        await sendWelcomeEmail(user);
      }
      
      user.lastLogin = new Date();
      await user.save();
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Microsoft Azure AD Strategy
const AzureStrategy = require('passport-azure-ad').OIDCStrategy;

passport.use(new AzureStrategy({
    identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    responseType: 'code',
    responseMode: 'query',
    redirectUrl: process.env.AZURE_CALLBACK_URL,
    allowHttpForRedirectUrl: process.env.NODE_ENV === 'development',
    scope: ['profile', 'email', 'openid'],
    passReqToCallback: true // Needed to attach claims to req
  },
  async (req, iss, sub, profile, accessToken, refreshToken, done) => {
    try {
      // The strategy validates the ID Token and provides claims in profile._json
      const claims = profile._json || {};
      
      // Attach claims to the request for the final callback handler
      req.authInfo = {
        amr: claims.amr || [],
        auth_time: claims.auth_time || Math.floor(Date.now() / 1000)
      };

      // 1. Extract email
      const email = profile.upn || profile.email || claims.email || claims.preferred_username;
      
      if (!email) {
        return done(new Error('Email not provided by Azure AD'), null);
      }

      // 2. Security Check: Capture Entra-managed MFA status
      const amr = profile._json?.amr || [];
      const hasMFA = amr.includes('mfa');
      
      console.log(`[AUTH DEBUG] User: ${email}, AMR: ${JSON.stringify(amr)}, hasMFA: ${hasMFA}`);

      // 3. Find or create user
      let user = await User.findOne({ 
        $or: [
          { providerId: profile.oid, provider: 'azure' },
          { email: email }
        ]
      });
      
      if (!user) {
        user = await User.create({
          name: profile.displayName || profile.name || email.split('@')[0],
          email: email,
          provider: 'azure',
          providerId: profile.oid,
          role: 'administrator', // Default role for Azure AD
          isVerified: true
        });
        
        await sendWelcomeEmail(user);
      } else {
        // Update provider info if logging in via Azure for the first time
        if (user.provider !== 'azure') {
          user.provider = 'azure';
          user.providerId = profile.oid;
        }
      }

      user.lastLogin = new Date();
      await user.save();
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  (req, res) => {
    const token = generateToken(req.user._id, req.user.role);
    const refreshToken = generateRefreshToken(req.user._id);
    
    // Set tokens in cookies
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&role=${req.user.role}`);
  }
);

// @route   GET /api/auth/azure
// @desc    Initiate Azure AD OAuth
// @access  Public
router.get('/azure', (req, res, next) => {
  const isStepUp = req.query.prompt === 'login';
  
  // Force session modification to ensure the session cookie is set and 'state' is persisted
  req.session.authInitiated = true;
  
  if (isStepUp) {
    req.session.pendingStepUp = true;
  }
  const options = {
    session: true,
    // Force 'login' prompt for step-up authentication, otherwise use 'select_account'
    prompt: isStepUp ? 'login' : 'select_account',
    customState: isStepUp ? 'stepup' : 'login',
    tenantIdOrName: process.env.AZURE_TENANT_ID
  };
  
  // Log the authentication attempt
  console.log(`[AUTH DEBUG] Initiating Azure AD Auth. Step-up: ${isStepUp}, Prompt: ${options.prompt}`);

  passport.authenticate('azuread-openidconnect', options)(req, res, next);
});

// @route   GET /api/auth/azure/callback
// @desc    Azure AD OAuth callback
// @access  Public
router.get('/azure/callback', (req, res, next) => {
  console.log('[AUTH DEBUG] Azure callback received via GET. Query present:', !!req.query.code);
  
  passport.authenticate('azuread-openidconnect', { session: true }, (err, user, info) => {
    if (err) {
      console.error('[AUTH ERROR] Passport Authentication Error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=passport_error&details=${encodeURIComponent(err.message)}`);
    }
    
    if (!user) {
      console.error('[AUTH ERROR] No user found in callback. Info:', info);
      const message = info?.message || 'Authentication failed';
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed&message=${encodeURIComponent(message)}`);
    }

    console.log(`[AUTH DEBUG] User authenticated: ${user.email}`);

    // Capture user data BEFORE req.logout() nullifies req.user
    const userRole = user.role;

    // Extract Entra-specific claims
    const amr = req.authInfo?.amr || [];

    // For step-up flows, Azure's auth_time reflects the original cached session time, not
    // the moment of this re-authentication. Use the current server time so the step-up
    // window check in requireStepUp() passes immediately after this redirect.
    const isStepUp = req.session.pendingStepUp === true;
    const authTime = isStepUp
      ? Math.floor(Date.now() / 1000)
      : (req.authInfo?.auth_time || Math.floor(Date.now() / 1000));

    // Clear the flag before req.logout() destroys the session
    if (isStepUp) {
      req.session.pendingStepUp = false;
    }

    const token = generateToken(user._id, userRole, amr, authTime);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });

    console.log(`[AUTH DEBUG] Token issued. Step-up: ${isStepUp}, authTime: ${authTime}`);

    // Clear the passport session after issuing JWT
    req.logout(() => {
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&role=${userRole}`);
    });
  })(req, res, next);
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// @route   POST /api/auth/revert-to-admin
// @desc    Revert the authenticated user's OWN role back to administrator.
// @access  Private + step-up
router.post('/revert-to-admin', protect, requireStepUp(300), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { role: 'administrator' },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const token = generateToken(user._id, user.role);

    console.log(`✅ Role reverted to administrator for: ${user.email}`);

    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to revert role.', error: error.message });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
