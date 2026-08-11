/**
 * Search Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPopularCities,
  getRecentSearches,
  getSuggestions,
  getTrendingSearches,
} = require('../controllers/searchController');

router.get('/popular', getPopularCities);
router.get('/suggestions', getSuggestions);
router.get('/trending', getTrendingSearches);
router.get('/recent', protect, getRecentSearches);

module.exports = router;
