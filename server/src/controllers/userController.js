/**
 * User Controller - Profile management, preferences, account deletion.
 */

const User = require('../models/User');
const UserSession = require('../models/UserSession');
const WeatherHistory = require('../models/WeatherHistory');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const cloudinary = require('../config/cloudinary');

/**
 * @desc    Get current user profile
 * @route   GET /api/users/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('favoriteCities');
  res.status(200).json({ success: true, user });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      preferences: user.preferences,
    },
  });
});

/**
 * @desc    Upload profile image to Cloudinary
 * @route   POST /api/users/profile-image
 * @access  Private
 */
const uploadProfileImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  const user = await User.findById(req.user._id);

  // Delete old image if exists
  if (user.cloudinaryId) {
    await cloudinary.uploader.destroy(user.cloudinaryId);
  }

  // Upload new image
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'meridian-weather/profiles',
    width: 300,
    crop: 'scale',
  });

  user.profileImage = result.secure_url;
  user.cloudinaryId = result.public_id;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile image updated',
    profileImage: user.profileImage,
  });
});

/**
 * @desc    Update user preferences
 * @route   PUT /api/users/preferences
 * @access  Private
 */
const updatePreferences = asyncHandler(async (req, res, next) => {
  const { theme, units, language, notifications } = req.body;
  const user = await User.findById(req.user._id);

  if (theme) user.preferences.theme = theme;
  if (units) user.preferences.units = units;
  if (language) user.preferences.language = language;
  if (typeof notifications === 'boolean') user.preferences.notifications = notifications;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Preferences updated',
    preferences: user.preferences,
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 400));
  }

  user.password = newPassword;
  await user.save();

  // Invalidate all sessions except current
  await UserSession.updateMany({ user: user._id }, { isActive: false });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please login again.',
  });
});

/**
 * @desc    Delete account
 * @route   DELETE /api/users/account
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  // Delete related data
  await Promise.all([
    UserSession.deleteMany({ user: userId }),
    WeatherHistory.deleteMany({ user: userId }),
    Favorite.deleteMany({ user: userId }),
    Notification.deleteMany({ user: userId }),
  ]);

  // Delete profile image from cloudinary
  const user = await User.findById(userId);
  if (user.cloudinaryId) {
    await cloudinary.uploader.destroy(user.cloudinaryId).catch(() => {});
  }

  await User.findByIdAndDelete(userId);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully',
  });
});

/**
 * @desc    Get user dashboard data
 * @route   GET /api/users/dashboard
 * @access  Private
 */
const getDashboard = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const [favorites, history, notifications, recentSearches] = await Promise.all([
    Favorite.find({ user: userId }).sort({ isPinned: -1, createdAt: -1 }).limit(10),
    WeatherHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(10),
    Notification.find({ user: userId, read: false }).sort({ createdAt: -1 }).limit(5),
    WeatherHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(5).select('location'),
  ]);

  res.status(200).json({
    success: true,
    data: {
      favorites,
      history,
      notifications,
      recentSearches,
      stats: {
        totalFavorites: await Favorite.countDocuments({ user: userId }),
        totalSearches: await WeatherHistory.countDocuments({ user: userId }),
        totalHistory: await WeatherHistory.countDocuments({ user: userId }),
        unreadNotifications: notifications.length,
      },
    },
  });
});

module.exports = {
  getMe,
  updateProfile,
  uploadProfileImage,
  updatePreferences,
  changePassword,
  deleteAccount,
  getDashboard,
};
