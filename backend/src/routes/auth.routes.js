const express = require('express');
const router = express.Router();
const passport = require('passport');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../services/email/emailService');

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
        
        // Send welcome email (non-blocking)
        sendWelcomeEmail(user).catch(err => {
          console.error('Failed to send welcome email to', user.email, ':', err.message);
        });
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
    
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&role=${req.user.role}`);
  }
);
// Custom Azure OAuth2 Handler (replaces OIDC strategy)
// Microsoft Azure AD OAuth2
const AZURE_AUTH_ENDPOINT = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/authorize`;
const AZURE_TOKEN_ENDPOINT = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`;

// Store state for CSRF protection
const authStates = new Map();

// @route   GET /api/auth/azure
// @desc    Initiate Azure AD OAuth
// @access  Public
router.get('/azure', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  authStates.set(state, { createdAt: Date.now() });
  
  const params = new URLSearchParams({
    client_id: process.env.AZURE_CLIENT_ID,
    redirect_uri: process.env.AZURE_CALLBACK_URL,
    response_type: 'code',
    scope: 'openid profile email',
    state: state,
    response_mode: 'query'
  });
  
  res.redirect(`${AZURE_AUTH_ENDPOINT}?${params.toString()}`);
});

// @route   GET /api/auth/azure/callback
// @desc    Azure AD OAuth callback
// @access  Public
router.get('/azure/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      console.error('❌ Azure callback: No authorization code');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
    }
    
    // Verify state
    const stateData = authStates.get(state);
    if (!stateData) {
      console.error('❌ Azure callback: Invalid state');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_state`);
    }
    
    authStates.delete(state);
    
    console.log('🔍 Azure callback: Exchanging code for token...');
    
    // Exchange authorization code for token
    let tokenResponse;
    try {
      // Use URLSearchParams to send form-encoded data (not JSON)
      // Azure token endpoint requires application/x-www-form-urlencoded
      const params = new URLSearchParams();
      params.append('client_id', process.env.AZURE_CLIENT_ID);
      params.append('client_secret', process.env.AZURE_CLIENT_SECRET);
      params.append('code', code);
      params.append('redirect_uri', process.env.AZURE_CALLBACK_URL);
      params.append('grant_type', 'authorization_code');
      
      console.log('📤 Sending token request to:', AZURE_TOKEN_ENDPOINT);
      tokenResponse = await axios.post(AZURE_TOKEN_ENDPOINT, params);
    } catch (tokenError) {
      console.error('❌ Azure token exchange failed:', {
        status: tokenError.response?.status,
        statusText: tokenError.response?.statusText,
        data: tokenError.response?.data,
        message: tokenError.message
      });
      throw tokenError;
    }
    
    const { id_token } = tokenResponse.data;
    
    if (!id_token) {
      console.error('❌ Azure callback: No id_token in response');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_token`);
    }
    
    console.log('✅ Azure callback: Got id_token');
    
    // Decode JWT (without verification for now, as we just validated it with Azure)
    const decoded = jwt.decode(id_token);
    
    if (!decoded) {
      console.error('❌ Azure callback: Could not decode token');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=invalid_token`);
    }
    
    console.log('🔍 Azure User Info:', {
      oid: decoded.oid,
      name: decoded.name,
      email: decoded.email || decoded.preferred_username
    });
    
    // Find or create user
    let user = await User.findOne({ providerId: decoded.oid, provider: 'azure' });
    
    if (!user) {
      user = await User.create({
        name: decoded.name,
        email: decoded.email || decoded.preferred_username,
        provider: 'azure',
        providerId: decoded.oid,
        role: 'administrator',
        isVerified: true
      });
      
      console.log('✅ New Azure user created:', user.email);
      
      // Send welcome email (non-blocking)
      sendWelcomeEmail(user).catch(err => {
        console.error('Failed to send welcome email:', err.message);
      });
    } else {
      console.log('✅ Existing Azure user found:', user.email);
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    // Set cookies
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
    
    console.log('✅ Azure Auth Success:', user.email);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}&role=${user.role}`);
  } catch (error) {
    console.error('❌ Azure callback error:', error.message);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
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

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
