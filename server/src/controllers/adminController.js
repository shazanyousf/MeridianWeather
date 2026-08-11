/**
 * Admin Controller - Admin dashboard, user management, analytics.
 */

const User = require('../models/User');
const Admin = require('../models/Admin');
const Feedback = require('../models/Feedback');
const WeatherAlert = require('../models/WeatherAlert');
const SearchLog = require('../models/SearchLog');
const ApiLog = require('../models/ApiLog');
const UserSession = require('../models/UserSession');
const Announcement = require('../models/Announcement');
const WeatherHistory = require('../models/WeatherHistory');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { generateAccessToken } = require('../utils/token');

/**
 * @desc    Admin login
 * @route   POST /api/admin/login
 * @access  Public (admin panel)
 */
const adminLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin || !(await admin.matchPassword(password))) {
    return next(new AppError('Invalid admin credentials', 401));
  }

  const accessToken = generateAccessToken(admin._id);

  res.status(200).json({
    success: true,
    accessToken,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      profileImage: admin.profileImage,
      isSuperAdmin: admin.isSuperAdmin,
    },
  });
});

/**
 * @desc    Get dashboard overview stats
 * @route   GET /api/admin/overview
 * @access  Admin
 */
const getOverview = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalVerified,
    totalBlocked,
    totalFeedback,
    totalAlerts,
    totalSearches,
    todaySearches,
    todayVisitors,
    totalApiCalls,
    activeSessions,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ isBlocked: true }),
    Feedback.countDocuments(),
    WeatherAlert.countDocuments({ isActive: true }),
    SearchLog.countDocuments(),
    SearchLog.countDocuments({ createdAt: { $gte: today } }),
    UserSession.countDocuments({ lastActive: { $gte: today } }),
    ApiLog.countDocuments(),
    UserSession.countDocuments({ isActive: true }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalVerified,
      totalBlocked,
      totalFeedback,
      totalAlerts,
      totalSearches,
      todaySearches,
      todayVisitors,
      totalApiCalls,
      activeSessions,
    },
  });
});

/**
 * @desc    Get all users (with search & pagination)
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { search, status } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (status === 'blocked') query.isBlocked = true;
  if (status === 'active') query.isBlocked = false;
  if (status === 'verified') query.isVerified = true;
  if (status === 'unverified') query.isVerified = false;

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

/**
 * @desc    Get single user
 * @route   GET /api/admin/users/:id
 * @access  Admin
 */
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('favoriteCities');
  if (!user) return next(new AppError('User not found', 404));
  res.status(200).json({ success: true, data: user });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  // Clean related data
  await Promise.all([
    UserSession.deleteMany({ user: user._id }),
    WeatherHistory.deleteMany({ user: user._id }),
    Feedback.deleteMany({ user: user._id }),
  ]);

  res.status(200).json({ success: true, message: 'User deleted' });
});

/**
 * @desc    Block/Unblock user
 * @route   PUT /api/admin/users/:id/block
 * @access  Admin
 */
const toggleBlockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  user.isBlocked = !user.isBlocked;
  await user.save();

  // If blocked, deactivate sessions
  if (user.isBlocked) {
    await UserSession.updateMany({ user: user._id }, { isActive: false });
  }

  res.status(200).json({
    success: true,
    message: user.isBlocked ? 'User blocked' : 'User unblocked',
    isBlocked: user.isBlocked,
  });
});

/**
 * @desc    Promote user (make admin)
 * @route   PUT /api/admin/users/:id/promote
 * @access  Super Admin
 */
const promoteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  // Create admin account from user
  const existingAdmin = await Admin.findOne({ email: user.email });
  if (existingAdmin) {
    return next(new AppError('User is already an admin', 400));
  }

  await Admin.create({
    name: user.name,
    email: user.email,
    password: 'Promoted@123', // temporary; admin should reset
    role: 'admin',
  });

  res.status(200).json({ success: true, message: 'User promoted to admin' });
});

/**
 * @desc    Get search statistics
 * @route   GET /api/admin/search-stats
 * @access  Admin
 */
const getSearchStats = asyncHandler(async (req, res, next) => {
  const days = parseInt(req.query.days) || 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [topQueries, dailySearches, total] = await Promise.all([
    SearchLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$query', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    SearchLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    SearchLog.countDocuments({ createdAt: { $gte: since } }),
  ]);

  res.status(200).json({ success: true, data: { topQueries, dailySearches, total } });
});

/**
 * @desc    Get API usage stats
 * @route   GET /api/admin/api-usage
 * @access  Admin
 */
const getApiUsage = asyncHandler(async (req, res, next) => {
  const days = parseInt(req.query.days) || 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [byProvider, dailyCalls, successRate, avgResponse] = await Promise.all([
    ApiLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$provider', count: { $sum: 1 }, success: { $sum: { $cond: ['$success', 1, 0] } } } },
    ]),
    ApiLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    ApiLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: null, total: { $sum: 1 }, success: { $sum: { $cond: ['$success', 1, 0] } } } },
    ]),
    ApiLog.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: null, avgResponseTime: { $avg: '$responseTime' } } },
    ]),
  ]);

  const total = successRate[0]?.total || 0;
  const success = successRate[0]?.success || 0;
  const failed = total - success;
  const avgResponseTime = avgResponse[0]?.avgResponseTime || 0;

  res.status(200).json({
    success: true,
    data: {
      total,
      success,
      failed,
      avgResponseTime,
      byProvider,
      dailyCalls,
      successRate: successRate[0],
    },
  });
});

/**
 * @desc    Get user growth analytics
 * @route   GET /api/admin/user-analytics
 * @access  Admin
 */
const getUserAnalytics = asyncHandler(async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [userGrowth, dailyVisitors] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    UserSession.aggregate([
      { $match: { lastActive: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastActive' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const totalUsers = await User.countDocuments();
  const activeToday = await UserSession.countDocuments({
    lastActive: { $gte: new Date().setHours(0, 0, 0, 0) },
  });

  res.status(200).json({
    success: true,
    data: { userGrowth, dailyVisitors, totalUsers, activeToday },
  });
});

/**
 * @desc    Get all feedback
 * @route   GET /api/admin/feedback
 * @access  Admin
 */
const getAllFeedback = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [feedback, total] = await Promise.all([
    Feedback.find().populate('user', 'name email profileImage').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Feedback.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: feedback,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

/**
 * @desc    Get all weather alerts
 * @route   GET /api/admin/alerts
 * @access  Admin
 */
const getAllAlerts = asyncHandler(async (req, res, next) => {
  const alerts = await WeatherAlert.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: alerts });
});

/**
 * @desc    Get all admins
 * @route   GET /api/admin/admins
 * @access  Super Admin
 */
const getAdmins = asyncHandler(async (req, res, next) => {
  const admins = await Admin.find().select('-password');
  res.status(200).json({ success: true, data: admins });
});

/**
 * @desc    Delete admin
 * @route   DELETE /api/admin/admins/:id
 * @access  Super Admin
 */
const deleteAdmin = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return next(new AppError('Admin not found', 404));
  if (admin.isSuperAdmin) {
    return next(new AppError('Cannot delete super admin', 400));
  }
  await admin.remove();
  res.status(200).json({ success: true, message: 'Admin deleted' });
});

module.exports = {
  adminLogin,
  getOverview,
  getUsers,
  getUserById,
  deleteUser,
  toggleBlockUser,
  promoteUser,
  getSearchStats,
  getApiUsage,
  getUserAnalytics,
  getAllFeedback,
  getAllAlerts,
  getAdmins,
  deleteAdmin,
};
