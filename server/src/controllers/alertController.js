/**
 * Alert Controller - Weather alerts & notifications to users.
 */

const WeatherAlert = require('../models/WeatherAlert');
const Notification = require('../models/Notification');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { sendEmail } = require('../config/nodemailer');
const { weatherAlertTemplate } = require('../utils/emailTemplates');

/**
 * @desc    Get active weather alerts
 * @route   GET /api/alerts
 * @access  Public
 */
const getActiveAlerts = asyncHandler(async (req, res, next) => {
  const alerts = await WeatherAlert.find({
    isActive: true,
    $or: [{ expiresAt: { $gt: Date.now() } }, { expiresAt: null }],
  }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: alerts });
});

/**
 * @desc    Get alerts for user's area (by coordinates)
 * @route   GET /api/alerts/nearby?lat=..&lon=..
 * @access  Public
 */
const getNearbyAlerts = asyncHandler(async (req, res, next) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  const alerts = await WeatherAlert.find({
    isActive: true,
    geoArea: {
      $near: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
        $maxDistance: 500000, // 500km
      },
    },
  }).sort({ severity: 1 });

  res.status(200).json({ success: true, data: alerts });
});

/**
 * @desc    Create a weather alert (Admin)
 * @route   POST /api/alerts
 * @access  Admin
 */
const createAlert = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    type,
    severity,
    city,
    state,
    country,
    lat,
    lon,
    expiresAt,
  } = req.body;

  const alert = await WeatherAlert.create({
    title,
    description,
    type,
    severity: severity || 'moderate',
    location: { city, state, country },
    expiresAt,
    geoArea: {
      type: 'Point',
      coordinates: [lat, lon],
    },
  });

  // Notify all verified users
  if (severity === 'severe' || severity === 'extreme') {
    const users = await User.find({ isVerified: true, isBlocked: false });
    for (const user of users) {
      // Create in-app notification
      await Notification.create({
        user: user._id,
        title: `⚠️ ${title}`,
        message: description,
        type: 'warning',
        category: type,
      });

      // Send email notification
      if (user.preferences?.notifications) {
        try {
          await sendEmail({
            to: user.email,
            subject: `⚠️ Weather Alert: ${title}`,
            html: weatherAlertTemplate(user.name, { title, description, severity, location: { city } }),
          });
        } catch (err) {}
      }
    }
  }

  res.status(201).json({ success: true, data: alert });
});

/**
 * @desc    Update an alert (Admin)
 * @route   PUT /api/alerts/:id
 * @access  Admin
 */
const updateAlert = asyncHandler(async (req, res, next) => {
  const alert = await WeatherAlert.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  res.status(200).json({ success: true, data: alert });
});

/**
 * @desc    Deactivate an alert (Admin)
 * @route   DELETE /api/alerts/:id
 * @access  Admin
 */
const deleteAlert = asyncHandler(async (req, res, next) => {
  const alert = await WeatherAlert.findByIdAndDelete(req.params.id);

  if (!alert) {
    return next(new AppError('Alert not found', 404));
  }

  res.status(200).json({ success: true, message: 'Alert deleted' });
});

module.exports = {
  getActiveAlerts,
  getNearbyAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
};
