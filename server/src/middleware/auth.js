/**
 * Authentication Middleware - Verifies JWT access token.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

/**
 * Protect user routes - requires a valid access token.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, no token provided', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Fetch user
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new AppError('User not found', 401));
    }

    if (user.isBlocked) {
      return next(new AppError('Your account has been blocked. Contact admin.', 403));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Not authorized, token invalid or expired', 401));
  }
});

/**
 * RESTRICT middleware factory - allows only specified roles.
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

/**
 * Protect admin routes.
 */
const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, no token provided', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return next(new AppError('Admin not found', 401));
    }

    req.admin = admin;
    next();
  } catch (error) {
    return next(new AppError('Not authorized, token invalid or expired', 401));
  }
});

/**
 * Optional auth - allows both authenticated and guest users.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && !user.isBlocked) {
        req.user = user;
      }
    } catch (error) {
      // Ignore invalid token for optional auth
    }
  }
  next();
});

module.exports = { protect, restrictTo, protectAdmin, optionalAuth };
