const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate MFA secret for user
const generateMFASecret = (userEmail) => {
  const secret = speakeasy.generateSecret({
    name: `Cloud Heroes Africa (${userEmail})`,
    issuer: 'Cloud Heroes Africa',
    length: 32
  });
  
  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url
  };
};

// Generate QR code for MFA setup
const generateQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

// Verify MFA token
const verifyMFAToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2
  });
};

// Generate backup codes
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
};

module.exports = {
  generateMFASecret,
  generateQRCode,
  verifyMFAToken,
  generateBackupCodes
};
