/**
 * Search Controller - Popular cities, recent searches, suggestions.
 */

const SearchLog = require('../models/SearchLog');
const WeatherHistory = require('../models/WeatherHistory');
const asyncHandler = require('../utils/asyncHandler');

// Popular cities for quick access
const POPULAR_CITIES = [
  { city: 'New York', country: 'USA', lat: 40.7128, lon: -74.006 },
  { city: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { city: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { city: 'Mumbai', country: 'India', lat: 19.076, lon: 72.8777 },
  { city: 'Delhi', country: 'India', lat: 28.7041, lon: 77.1025 },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
  { city: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.405 },
  { city: 'Moscow', country: 'Russia', lat: 55.7558, lon: 37.6173 },
];

/**
 * @desc    Get popular cities
 * @route   GET /api/search/popular
 * @access  Public
 */
const getPopularCities = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: POPULAR_CITIES });
});

/**
 * @desc    Get recent searches for a user
 * @route   GET /api/search/recent
 * @access  Private
 */
const getRecentSearches = asyncHandler(async (req, res, next) => {
  const searches = await WeatherHistory.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('location createdAt');

  res.status(200).json({ success: true, data: searches });
});

/**
 * @desc    Get search suggestions
 * @route   GET /api/search/suggestions?q=..
 * @access  Public
 */
const getSuggestions = asyncHandler(async (req, res, next) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.status(200).json({ success: true, data: [] });
  }

  // Search popular cities first
  const matches = POPULAR_CITIES.filter(
    (c) => c.city.toLowerCase().includes(q.toLowerCase()) || c.country.toLowerCase().includes(q.toLowerCase())
  );

  res.status(200).json({ success: true, data: matches });
});

/**
 * @desc    Get trending searches (global, for analytics)
 * @route   GET /api/search/trending
 * @access  Public
 */
const getTrendingSearches = asyncHandler(async (req, res, next) => {
  const days = parseInt(req.query.days) || 7;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const trending = await SearchLog.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: '$query', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json({ success: true, data: trending });
});

module.exports = {
  getPopularCities,
  getRecentSearches,
  getSuggestions,
  getTrendingSearches,
};
