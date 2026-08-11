/**
 * Announcement Controller - Admin announcements.
 */

const Announcement = require('../models/Announcement');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

/**
 * @desc    Get active announcements (public)
 * @route   GET /api/announcements
 * @access  Public
 */
const getActiveAnnouncements = asyncHandler(async (req, res, next) => {
  const announcements = await Announcement.find({
    isActive: true,
    $or: [{ expiresAt: { $gt: Date.now() } }, { expiresAt: null }],
  })
    .sort({ priority: 1, createdAt: -1 })
    .limit(5);

  res.status(200).json({ success: true, data: announcements });
});

/**
 * @desc    Get all announcements (Admin)
 * @route   GET /api/announcements/all
 * @access  Admin
 */
const getAllAnnouncements = asyncHandler(async (req, res, next) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: announcements });
});

/**
 * @desc    Create announcement (Admin)
 * @route   POST /api/announcements
 * @access  Admin
 */
const createAnnouncement = asyncHandler(async (req, res, next) => {
  const { title, message, type, priority, expiresAt } = req.body;

  if (!title || !message) {
    return next(new AppError('Title and message are required', 400));
  }

  const announcement = await Announcement.create({
    title,
    message,
    type: type || 'info',
    priority: priority || 'medium',
    createdBy: req.admin._id,
    expiresAt,
  });

  res.status(201).json({ success: true, data: announcement });
});

/**
 * @desc    Update announcement (Admin)
 * @route   PUT /api/announcements/:id
 * @access  Admin
 */
const updateAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }

  res.status(200).json({ success: true, data: announcement });
});

/**
 * @desc    Delete announcement (Admin)
 * @route   DELETE /api/announcements/:id
 * @access  Admin
 */
const deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findByIdAndDelete(req.params.id);
  if (!announcement) {
    return next(new AppError('Announcement not found', 404));
  }
  res.status(200).json({ success: true, message: 'Announcement deleted' });
});

module.exports = {
  getActiveAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
