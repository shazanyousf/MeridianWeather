/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  sendOTP,
  verifyOTP,
  forgotPassword,
  resetPasswordWithOTP,
  resetPassword,
} = require('../controllers/authController');
const {
  registerValidator,
  loginValidator,
  otpValidator,
  verifyEmailValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  resetPasswordWithOTPValidator,
  refreshTokenValidator,
} = require('../validators/authValidator');

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/logout', logout);
router.post('/refresh', refreshTokenValidator, refreshToken);
router.post('/verify-email', verifyEmailValidator, verifyEmail);
router.post('/send-otp', forgotPasswordValidator, sendOTP);
router.post('/verify-otp', otpValidator, verifyOTP);
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/reset-password-with-otp', resetPasswordWithOTPValidator, resetPasswordWithOTP);
router.post('/reset-password', resetPasswordValidator, resetPassword);

// Test protected route
router.get('/me', protect, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

module.exports = router;
