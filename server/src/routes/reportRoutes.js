/**
 * Report Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  exportHistoryCSV,
  exportFavoritesCSV,
  getStatistics,
} = require('../controllers/reportController');

router.use(protect);

router.get('/history/csv', exportHistoryCSV);
router.get('/favorites/csv', exportFavoritesCSV);
router.get('/statistics', getStatistics);

module.exports = router;
