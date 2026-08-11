/**
 * Feedback Routes
 */

const express = require('express');
const router = express.Router();
const { protect, protectAdmin } = require('../middleware/auth');
const {
  submitFeedback,
  getMyFeedback,
  updateFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');

// User routes
router.post('/', protect, submitFeedback);
router.get('/my', protect, getMyFeedback);

// Admin routes
router.put('/:id', protectAdmin, updateFeedback);
router.delete('/:id', protectAdmin, deleteFeedback);

module.exports = router;
