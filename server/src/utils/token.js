/**
 * Token utilities - JWT access & refresh token generation.
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT access token.
 */
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
};

/**
 * Generate JWT refresh token.
 */
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
};

/**
 * Verify refresh token.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Generate random OTP (6 digits).
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a random token for email verification / password reset.
 */
const generateRandomToken = () => {
  return require('crypto').randomBytes(32).toString('hex');
};

/**
 * Generate a base64 data URI for JWT refresh token.
 */
const generateDeviceId = () => {
  return require('crypto').randomBytes(16).toString('hex');
};

/**
 * Set cookie options for refresh token.
 */
const getRefreshCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateOTP,
  generateRandomToken,
  generateDeviceId,
  getRefreshCookieOptions,
};
