/**
 * Auth Controller - Handles all authentication flows.
 * Register, Login, Logout, Email Verification, OTP, Password Reset, Refresh Tokens.
 */

const User = require('../models/User');
const UserSession = require('../models/UserSession');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateOTP,
  generateRandomToken,
  generateDeviceId,
} = require('../utils/token');
const { sendEmail } = require('../config/nodemailer');
const {
  emailVerificationTemplate,
  otpTemplate,
  passwordResetTemplate,
  welcomeTemplate,
} = require('../utils/emailTemplates');

/**
 * Send tokens in response + set refresh token cookie.
 */
const sendTokenResponse = async (user, statusCode, res, rememberMe = false) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Create user session
  const session = await UserSession.create({
    user: user._id,
    refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    device: generateDeviceId(),
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    rememberMe,
    sessionId: session._id,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
      preferences: user.preferences,
    },
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
  });

  // Generate OTP for email verification
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save({ validateBeforeSave: false });

  // Send OTP email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email - Meridian Weather',
      html: otpTemplate(user.name, otp),
    });
  } catch (err) {
    // Avoid leaving a half-registered account with no way to verify.
    await User.findByIdAndDelete(user._id);
    return next(new AppError(`Registration failed: unable to send OTP email (${err.message})`, 500));
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful! An OTP has been sent to your email for verification.',
    email: user.email,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password, rememberMe } = req.body;

  // Find user with password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check if blocked
  if (user.isBlocked) {
    return next(new AppError('Your account has been blocked. Please contact support.', 403));
  }

  // Check if email is verified (OTP verification required)
  if (!user.isVerified) {
    return next(
      new AppError(
        'Your email is not verified. Please verify your email using the OTP sent to your inbox before logging in.',
        403
      )
    );
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  return sendTokenResponse(user, 200, res, rememberMe);
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    // Deactivate session
    await UserSession.findOneAndUpdate(
      { refreshToken },
      { isActive: false },
      { new: true }
    );
  }

  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token required', 400));
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check session exists & active
    const session = await UserSession.findOne({
      refreshToken,
      user: decoded.id,
      isActive: true,
    });
    if (!session) {
      return next(new AppError('Invalid session, please login again', 401));
    }

    // Check user still exists
    const user = await User.findById(decoded.id);
    if (!user || user.isBlocked) {
      return next(new AppError('User not found or blocked', 401));
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Rotate refresh token
    session.refreshToken = newRefreshToken;
    session.lastActive = Date.now();
    await session.save();

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }
});

/**
 * @desc    Verify email via token
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res, next) => {
  const { email, token } = req.body;

  const user = await User.findOne({
    email,
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Verification token is invalid or has expired', 400));
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Create welcome notification
  await Notification.create({
    user: user._id,
    title: 'Welcome to Meridian Weather!',
    message: 'Your email has been verified. Explore real-time weather now!',
    type: 'success',
    category: 'general',
  });

  // Send welcome email
  try {
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Meridian Weather!',
      html: welcomeTemplate(user.name),
    });
  } catch (err) {
    console.log('Welcome email failed:', err.message);
  }

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now login.',
  });
});

/**
 * @desc    Send OTP to email
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
const sendOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No user found with this email', 404));
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      to: user.email,
      subject: 'Your OTP Code - Meridian Weather',
      html: otpTemplate(user.name, otp),
    });
  } catch (err) {
    return next(new AppError(`Unable to send OTP email (${err.message})`, 500));
  }

  res.status(200).json({
    success: true,
    message: 'OTP sent to your email',
  });
});

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
const verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    otp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('OTP is invalid or has expired', 400));
  }

  // Check if this is a registration verification (user not yet verified)
  const isRegistrationVerification = !user.isVerified;

  // Mark email as verified
  user.isVerified = true;
  user.emailVerifiedAt = Date.now();
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Create welcome notification on first verification
  if (isRegistrationVerification) {
    await Notification.create({
      user: user._id,
      title: 'Welcome to Meridian Weather!',
      message: 'Your email has been verified. Explore real-time weather now!',
      type: 'success',
      category: 'general',
    });

    // Send welcome email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Meridian Weather!',
        html: welcomeTemplate(user.name),
      });
    } catch (err) {
      console.log('Welcome email failed:', err.message);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Email verified successfully!',
  });
});

/**
 * @desc    Forgot password - send OTP to email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Only allow verified users to reset password
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('No account found with this email', 404));
  }

  // Generate OTP for password reset verification
  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  await user.save({ validateBeforeSave: false });

  try {
    await sendEmail({
      to: user.email,
      subject: 'Your Password Reset OTP - Meridian Weather',
      html: otpTemplate(user.name, otp),
    });
  } catch (err) {
    return next(new AppError(`Unable to send password reset OTP (${err.message})`, 500));
  }

  res.status(200).json({
    success: true,
    message: 'An OTP has been sent to your email to reset your password.',
    email: user.email,
  });
});

/**
 * @desc    Verify OTP and reset password in one step (forgot password flow)
 * @route   POST /api/auth/reset-password-with-otp
 * @access  Public
 */
const resetPasswordWithOTP = asyncHandler(async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({
    email,
    otp,
    otpExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('OTP is invalid or has expired', 400));
  }

  // Clear OTP and set new password
  user.otp = undefined;
  user.otpExpires = undefined;
  user.password = password;
  await user.save();

  // Invalidate all sessions
  await UserSession.updateMany({ user: user._id }, { isActive: false });

  res.status(200).json({
    success: true,
    message: 'Password reset successful! You can now login with your new password.',
  });
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Reset token is invalid or has expired', 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  // Invalidate all sessions
  await UserSession.updateMany({ user: user._id }, { isActive: false });

  res.status(200).json({
    success: true,
    message: 'Password reset successful! You can now login with your new password.',
  });
});

module.exports = {
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
};
