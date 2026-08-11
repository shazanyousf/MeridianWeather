/**
 * Weather Routes
 */

const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
  searchLocation,
  reverseGeocodeLocation,
  getCurrentWeather,
  getForecast,
  getPastWeather,
  getWeatherByCity,
  getWeatherHistory,
} = require('../controllers/weatherController');

// Public routes (optional auth)
router.get('/geocode', optionalAuth, searchLocation);
router.get('/reverse-geocode', optionalAuth, reverseGeocodeLocation);
router.get('/current', optionalAuth, getCurrentWeather);
router.get('/forecast', optionalAuth, getForecast);
router.get('/past', optionalAuth, getPastWeather);
router.get('/city', optionalAuth, getWeatherByCity);

// Protected routes
router.get('/history', protect, getWeatherHistory);

module.exports = router;
