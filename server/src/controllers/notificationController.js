/**
 * Notification Controller - Manage user notifications.
 */

const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const { unreadOnly } = req.query;

  const query = { user: req.user._id };
  if (unreadOnly === 'true') query.read = false;

  const [notifications, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(query),
  ]);

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    read: false,
  });

  res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({ success: true, data: notification });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );

  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({ success: true, message: 'Notification deleted' });
});

/**
 * @desc    Delete all notifications
 * @route   DELETE /api/notifications
 * @access  Private
 */
const deleteAllNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ user: req.user._id });
  res.status(200).json({ success: true, message: 'All notifications deleted' });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};
