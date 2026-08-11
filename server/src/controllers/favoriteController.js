/**
 * Favorite Controller - Manage users' favorite cities.
 */

const Favorite = require('../models/Favorite');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

/**
 * @desc    Get all user favorites
 * @route   GET /api/favorites
 * @access  Private
 */
const getFavorites = asyncHandler(async (req, res, next) => {
  const favorites = await Favorite.find({ user: req.user._id }).sort({
    isPinned: -1,
    createdAt: -1,
  });
  res.status(200).json({ success: true, data: favorites });
});

/**
 * @desc    Add a favorite city
 * @route   POST /api/favorites
 * @access  Private
 */
const addFavorite = asyncHandler(async (req, res, next) => {
  const { city, state, country, zipCode, lat, lon, note } = req.body;

  if (!city || !lat || !lon) {
    return next(new AppError('City, latitude and longitude are required', 400));
  }

  // Check if already exists
  const existing = await Favorite.findOne({
    user: req.user._id,
    'location.city': city,
  });

  if (existing) {
    return next(new AppError('This city is already in your favorites', 400));
  }

  const favorite = await Favorite.create({
    user: req.user._id,
    location: { city, state, country, zipCode, lat, lon },
    note: note || '',
  });

  // Add to user's favoriteCities
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { favoriteCities: favorite._id },
  });

  res.status(201).json({ success: true, data: favorite });
});

/**
 * @desc    Remove a favorite
 * @route   DELETE /api/favorites/:id
 * @access  Private
 */
const removeFavorite = asyncHandler(async (req, res, next) => {
  const favorite = await Favorite.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!favorite) {
    return next(new AppError('Favorite not found', 404));
  }

  // Remove from user's favoriteCities
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { favoriteCities: favorite._id },
  });

  res.status(200).json({ success: true, message: 'Favorite removed' });
});

/**
 * @desc    Toggle pin a favorite
 * @route   PUT /api/favorites/:id/pin
 * @access  Private
 */
const togglePin = asyncHandler(async (req, res, next) => {
  const favorite = await Favorite.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!favorite) {
    return next(new AppError('Favorite not found', 404));
  }

  favorite.isPinned = !favorite.isPinned;
  await favorite.save();

  res.status(200).json({ success: true, data: favorite });
});

/**
 * @desc    Update favorite note
 * @route   PUT /api/favorites/:id
 * @access  Private
 */
const updateFavorite = asyncHandler(async (req, res, next) => {
  const { note } = req.body;
  const favorite = await Favorite.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { note: note || '' },
    { new: true, runValidators: true }
  );

  if (!favorite) {
    return next(new AppError('Favorite not found', 404));
  }

  res.status(200).json({ success: true, data: favorite });
});

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  togglePin,
  updateFavorite,
};
