/**
 * Favorite Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  togglePin,
  updateFavorite,
} = require('../controllers/favoriteController');

router.use(protect);

router.route('/').get(getFavorites).post(addFavorite);
router.route('/:id').delete(removeFavorite).put(updateFavorite);
router.put('/:id/pin', togglePin);

module.exports = router;
