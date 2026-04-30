const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');
      
      // Attach auth metadata for step-up checks
      req.userAmr = decoded.amr || [];
      req.userAuthTime = decoded.authTime || Math.floor(Date.now() / 1000);

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Step-up Authentication Middleware
 * Ensures the user has performed a fresh Entra MFA within the last X minutes.
 * Used for sensitive operations like role changes or data deletion.
 */
exports.requireStepUp = (maxAgeInSeconds = 900) => {
  return (req, res, next) => {
    // Only applies to Azure/Entra users
    if (req.user.provider !== 'azure') {
      return next();
    }

    const now = Math.floor(Date.now() / 1000);
    const authTime = req.userAuthTime; // Set by protect middleware
    const ageInSeconds = now - authTime;

    if (ageInSeconds > maxAgeInSeconds) {
      return res.status(403).json({
        success: false,
        message: 'Elevated security required. Please re-authenticate to perform this action.',
        requireStepUp: true,
        authUrl: `${process.env.API_URL}/api/auth/azure?prompt=login`
      });
    }

    next();
  };
};

