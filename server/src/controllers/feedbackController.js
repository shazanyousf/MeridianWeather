/**
 * Feedback Controller - User feedback & ratings.
 */

const Feedback = require('../models/Feedback');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

/**
 * @desc    Submit feedback
 * @route   POST /api/feedback
 * @access  Private
 */
const submitFeedback = asyncHandler(async (req, res, next) => {
  const { subject, message, rating, category } = req.body;

  if (!subject || !message) {
    return next(new AppError('Subject and message are required', 400));
  }

  const feedback = await Feedback.create({
    user: req.user._id,
    subject,
    message,
    rating: rating || 5,
    category: category || 'suggestion',
  });

  res.status(201).json({ success: true, data: feedback });
});

/**
 * @desc    Get user's own feedback
 * @route   GET /api/feedback/my
 * @access  Private
 */
const getMyFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: feedback });
});

/**
 * @desc    Update feedback status (Admin)
 * @route   PUT /api/feedback/:id
 * @access  Admin
 */
const updateFeedback = asyncHandler(async (req, res, next) => {
  const { status, adminReply } = req.body;
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { status, adminReply },
    { new: true, runValidators: true }
  );

  if (!feedback) {
    return next(new AppError('Feedback not found', 404));
  }

  res.status(200).json({ success: true, data: feedback });
});

/**
 * @desc    Delete feedback (Admin)
 * @route   DELETE /api/feedback/:id
 * @access  Admin
 */
const deleteFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);
  if (!feedback) {
    return next(new AppError('Feedback not found', 404));
  }
  res.status(200).json({ success: true, message: 'Feedback deleted' });
});

module.exports = { submitFeedback, getMyFeedback, updateFeedback, deleteFeedback };
