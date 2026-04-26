const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateMFASecret, generateQRCode, verifyMFAToken, generateBackupCodes } = require('../services/mfa/mfaService');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @route   POST /api/mfa/setup
// @desc    Generate MFA secret and QR code
// @access  Private
router.post('/setup', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is already enabled'
      });
    }
    
    const { secret, otpauthUrl } = generateMFASecret(user.email);
    const qrCode = await generateQRCode(otpauthUrl);
    
    // Store secret temporarily (not enabled yet)
    user.mfaSecret = secret;
    await user.save();
    
    res.json({
      success: true,
      qrCode,
      secret,
      message: 'Scan QR code with Google Authenticator, Microsoft Authenticator, or Authy'
    });
  } catch (error) {
    console.error('MFA Setup Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup MFA',
      error: error.message
    });
  }
});

// @route   POST /api/mfa/verify-setup
// @desc    Verify MFA token and enable MFA
// @access  Private
router.post('/verify-setup', protect, async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
    
    const user = await User.findById(req.user.id).select('+mfaSecret');
    
    if (!user.mfaSecret) {
      return res.status(400).json({
        success: false,
        message: 'MFA setup not initiated'
      });
    }
    
    const isValid = verifyMFAToken(user.mfaSecret, token);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    // Generate backup codes
    const backupCodes = generateBackupCodes();
    const hashedBackupCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );
    
    user.mfaEnabled = true;
    user.mfaEnrollmentDate = new Date();
    user.mfaBackupCodes = hashedBackupCodes;
    await user.save();
    
    res.json({
      success: true,
      message: 'MFA enabled successfully',
      backupCodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify MFA setup',
      error: error.message
    });
  }
});

// @route   POST /api/mfa/verify
// @desc    Verify MFA token during login
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
    
    const user = await User.findById(req.user.id).select('+mfaSecret +mfaBackupCodes');
    
    if (!user.mfaEnabled) {
      return res.status(400).json({
        success: false,
        message: 'MFA is not enabled'
      });
    }
    
    // Try TOTP verification first
    const isValid = verifyMFAToken(user.mfaSecret, token);
    
    if (isValid) {
      return res.json({
        success: true,
        message: 'MFA verified successfully'
      });
    }
    
    // Try backup codes
    for (let i = 0; i < user.mfaBackupCodes.length; i++) {
      const isBackupCodeValid = await bcrypt.compare(token, user.mfaBackupCodes[i]);
      if (isBackupCodeValid) {
        // Remove used backup code
        user.mfaBackupCodes.splice(i, 1);
        await user.save();
        
        return res.json({
          success: true,
          message: 'MFA verified with backup code',
          remainingBackupCodes: user.mfaBackupCodes.length
        });
      }
    }
    
    res.status(400).json({
      success: false,
      message: 'Invalid token or backup code'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify MFA',
      error: error.message
    });
  }
});

// @route   POST /api/mfa/disable
// @desc    Disable MFA
// @access  Private
router.post('/disable', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    user.mfaBackupCodes = undefined;
    user.mfaEnrollmentDate = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'MFA disabled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to disable MFA',
      error: error.message
    });
  }
});

// @route   POST /api/mfa/reset
// @desc    Reset MFA (for testing)
// @access  Private
router.post('/reset', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.mfaEnabled = false;
    user.mfaSecret = undefined;
    user.mfaBackupCodes = undefined;
    user.mfaEnrollmentDate = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: 'MFA reset successfully. You will be prompted to set it up again.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset MFA',
      error: error.message
    });
  }
});

// @route   GET /api/mfa/status
// @desc    Get MFA status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      mfaEnabled: user.mfaEnabled,
      mfaEnrollmentDate: user.mfaEnrollmentDate,
      isWithinGracePeriod: user.isWithinMfaGracePeriod(),
      role: user.role
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get MFA status',
      error: error.message
    });
  }
});

module.exports = router;
