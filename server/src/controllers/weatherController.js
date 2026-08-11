/**
 * Weather Controller - Handles weather data, geocoding, forecasts, AI recommendations.
 */

const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const WeatherHistory = require('../models/WeatherHistory');
const SearchLog = require('../models/SearchLog');
const {
  geocodeLocation,
  reverseGeocode,
  getWeather,
  getAirQuality,
  getHistoricalWeather,
} = require('../services/weatherService');
const { generateRecommendations } = require('../services/aiService');

/**
 * @desc    Search/geocode a location
 * @route   GET /api/weather/geocode?query=...
 * @access  Public
 */
const searchLocation = asyncHandler(async (req, res, next) => {
  const { query } = req.query;
  if (!query) {
    return next(new AppError('Query parameter is required', 400));
  }

  const results = await geocodeLocation(query, req.user?._id);

  // Log search (non-blocking - don't delay geocode results)
  SearchLog.create({
    user: req.user?._id || null,
    query,
    type: 'city',
    resultCount: results.length,
  }).catch(() => {});

  res.status(200).json({ success: true, results });
});

/**
 * @desc    Reverse geocode coordinates to a location name
 * @route   GET /api/weather/reverse-geocode?lat=..&lon=..
 * @access  Public
 */
const reverseGeocodeLocation = asyncHandler(async (req, res, next) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return next(new AppError('Invalid coordinates', 400));
  }

  let location = null;
  try {
    location = await reverseGeocode(latitude, longitude, req.user?._id);
  } catch (err) {
    // If reverse geocoding provider fails, still return coords so client can fall back
    location = null;
  }

  res.status(200).json({
    success: true,
    location: location || {
      name: 'Current Location',
      lat: latitude,
      lon: longitude,
    },
  });
});

/**
 * @desc    Get current weather, forecast & AI recommendations
 * @route   GET /api/weather/current?lat=..&lon=..
 * @access  Public
 */
const getCurrentWeather = asyncHandler(async (req, res, next) => {
  const { lat, lon, city, state, country } = req.query;

  if (!lat || !lon) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return next(new AppError('Invalid coordinates', 400));
  }

// Fetch weather + air quality in parallel to reduce response time
  let weatherData;
  let airQuality = null;
  [weatherData, airQuality] = await Promise.all([
    getWeather(latitude, longitude, req.user?._id),
    getAirQuality(latitude, longitude, req.user?._id).catch(() => null),
  ]);

  // Generate AI recommendations
  const recommendations = generateRecommendations(weatherData);

  // Save weather history + search log (non-blocking, don't delay response)
  if (req.user) {
    WeatherHistory.create({
      user: req.user._id,
      location: {
        city: city || 'Unknown',
        state,
        country,
        lat: latitude,
        lon: longitude,
      },
      weather: {
        temperature: weatherData.current.temperature,
        feelsLike: weatherData.current.feelsLike,
        condition: weatherData.current.condition,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.windSpeed,
        pressure: weatherData.current.pressure,
        icon: weatherData.current.icon,
      },
      source: req.query.source || 'search',
    }).catch(() => {});

    SearchLog.create({
      user: req.user._id,
      query: city || `${latitude},${longitude}`,
      location: { city, country },
      type: req.query.source || 'city',
      resultCount: 1,
    }).catch(() => {});
  }

  res.status(200).json({
    success: true,
    data: {
      ...weatherData,
      airQuality,
      recommendations,
      location: { city, state, country, lat: latitude, lon: longitude },
    },
  });
});

/**
 * @desc    Get hourly & daily forecast
 * @route   GET /api/weather/forecast?lat=..&lon=..
 * @access  Public
 */
const getForecast = asyncHandler(async (req, res, next) => {
  const { lat, lon, days } = req.query;

  if (!lat || !lon) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  const weatherData = await getWeather(
    parseFloat(lat),
    parseFloat(lon),
    req.user?._id
  );

  res.status(200).json({
    success: true,
    data: {
      hourly: weatherData.hourly,
      daily: weatherData.daily,
    },
  });
});

/**
 * @desc    Get historical weather for the past N days
 * @route   GET /api/weather/past?lat=..&lon=..&days=7&year=2024&date=2024-06-15
 * @access  Public
 */
const getPastWeather = asyncHandler(async (req, res, next) => {
  const { lat, lon } = req.query;
  const days = parseInt(req.query.days) || 7;
  const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
  const date = req.query.date;

  if (!lat || !lon) {
    return next(new AppError('Latitude and longitude are required', 400));
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return next(new AppError('Invalid coordinates', 400));
  }

  if (req.query.year && (!Number.isInteger(year) || year < 1940 || year >= new Date().getFullYear())) {
    return next(new AppError(`Year must be between 1940 and ${new Date().getFullYear() - 1}`, 400));
  }

  if (date) {
    const archiveCutoff = new Date();
    archiveCutoff.setDate(archiveCutoff.getDate() - 5);
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(new Date(`${date}T00:00:00Z`).getTime());
    if (!isValidDate || date < '1940-01-01' || date > archiveCutoff.toISOString().slice(0, 10)) {
      return next(new AppError(`Date must be between 1940-01-01 and ${archiveCutoff.toISOString().slice(0, 10)}`, 400));
    }
  }

  let historical;
  try {
    historical = await getHistoricalWeather(latitude, longitude, days, req.user?._id, year, date);
  } catch (error) {
    return next(new AppError('Historical weather data is temporarily unavailable. Please try again in a moment.', 503));
  }

  res.status(200).json({
    success: true,
    data: {
      provider: historical.provider,
      daily: historical.daily,
      timezone: historical.timezone,
    },
  });
});

/**
 * @desc    Get weather by city name (reverse geocode then fetch)
 * @route   GET /api/weather/city?city=...
 * @access  Public
 */
const getWeatherByCity = asyncHandler(async (req, res, next) => {
  const { city } = req.query;
  if (!city) {
    return next(new AppError('City parameter is required', 400));
  }

  // Geocode city
  const results = await geocodeLocation(city, req.user?._id);

  if (results.length === 0) {
    return next(new AppError('City not found. Please check the spelling.', 404));
  }

const location = results[0];

  // Fetch weather + air quality in parallel to reduce response time
  let weatherData;
  let airQuality = null;
  [weatherData, airQuality] = await Promise.all([
    getWeather(location.lat, location.lon, req.user?._id),
    getAirQuality(location.lat, location.lon, req.user?._id).catch(() => null),
  ]);
  const recommendations = generateRecommendations(weatherData);

  // Save history + search log (non-blocking, don't delay response)
  if (req.user) {
    WeatherHistory.create({
      user: req.user._id,
      location: {
        city: location.name,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
      },
      weather: {
        temperature: weatherData.current.temperature,
        condition: weatherData.current.condition,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.windSpeed,
        pressure: weatherData.current.pressure,
        icon: weatherData.current.icon,
      },
      source: req.query.source || 'search',
    }).catch(() => {});

    SearchLog.create({
      user: req.user._id,
      query: city,
      location: { city: location.name, country: location.country },
      type: req.query.source || 'city',
      resultCount: results.length,
    }).catch(() => {});
  }

  res.status(200).json({
    success: true,
    data: {
      ...weatherData,
      airQuality,
      recommendations,
      location: {
        city: location.name,
        state: location.admin1,
        country: location.country,
        lat: location.lat,
        lon: location.lon,
      },
    },
  });
});

/**
 * @desc    Get weather history for a user
 * @route   GET /api/weather/history
 * @access  Private
 */
const getWeatherHistory = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([
    WeatherHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    WeatherHistory.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    data: history,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

module.exports = {
  searchLocation,
  reverseGeocodeLocation,
  getCurrentWeather,
  getForecast,
  getPastWeather,
  getWeatherByCity,
  getWeatherHistory,
};
