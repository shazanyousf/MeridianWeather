/**
 * Report Controller - Generate weather reports (CSV).
 * PDF/Excel generation handled with client-side libraries or can be extended.
 */

const WeatherHistory = require('../models/WeatherHistory');
const Favorite = require('../models/Favorite');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

/**
 * Helper to convert array of objects to CSV string.
 */
const toCSV = (rows) => {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const headerLine = headers.join(',');
  const bodyLines = rows.map((row) =>
    headers
      .map((h) => {
        const val = row[h] ?? '';
        // Escape commas, quotes, newlines
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );
  return [headerLine, ...bodyLines].join('\n');
};

/**
 * @desc    Export weather history as CSV
 * @route   GET /api/reports/history/csv
 * @access  Private
 */
const exportHistoryCSV = asyncHandler(async (req, res, next) => {
  const history = await WeatherHistory.find({ user: req.user._id }).sort({ createdAt: -1 });

  const rows = history.map((h) => ({
    City: h.location.city,
    Country: h.location.country,
    Temperature: h.weather.temperature,
    'Feels Like': h.weather.feelsLike,
    Condition: h.weather.condition,
    Humidity: h.weather.humidity,
    'Wind Speed': h.weather.windSpeed,
    Pressure: h.weather.pressure,
    Source: h.source,
    Date: h.createdAt,
  }));

  const csv = toCSV(rows);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=weather-history.csv');
  res.status(200).send(csv);
});

/**
 * @desc    Export favorites as CSV
 * @route   GET /api/reports/favorites/csv
 * @access  Private
 */
const exportFavoritesCSV = asyncHandler(async (req, res, next) => {
  const favorites = await Favorite.find({ user: req.user._id });

  const rows = favorites.map((f) => ({
    City: f.location.city,
    State: f.location.state,
    Country: f.location.country,
    'Zip Code': f.location.zipCode,
    Latitude: f.location.lat,
    Longitude: f.location.lon,
    Pinned: f.isPinned,
    Note: f.note,
  }));

  const csv = toCSV(rows);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=favorites.csv');
  res.status(200).send(csv);
});

/**
 * @desc    Get weather statistics summary
 * @route   GET /api/reports/statistics
 * @access  Private
 */
const getStatistics = asyncHandler(async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const history = await WeatherHistory.find({
    user: req.user._id,
    createdAt: { $gte: since },
  });

  if (history.length === 0) {
    return res.status(200).json({ success: true, data: { totalSearches: 0, message: 'No data available' } });
  }

  const temps = history.map((h) => h.weather.temperature).filter((t) => t != null);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
  const maxTemp = Math.max(...temps);
  const minTemp = Math.min(...temps);

  // Condition distribution
  const conditions = {};
  history.forEach((h) => {
    const c = h.weather.condition || 'Unknown';
    conditions[c] = (conditions[c] || 0) + 1;
  });

  res.status(200).json({
    success: true,
    data: {
      totalSearches: history.length,
      avgTemp: avgTemp.toFixed(1),
      maxTemp,
      minTemp,
      conditions,
      days,
    },
  });
});

module.exports = { exportHistoryCSV, exportFavoritesCSV, getStatistics };
