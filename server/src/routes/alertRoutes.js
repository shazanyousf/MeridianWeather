/**
 * Alert Routes
 */

const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/auth');
const {
  getActiveAlerts,
  getNearbyAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
} = require('../controllers/alertController');

// Public routes
router.get('/', getActiveAlerts);
router.get('/nearby', getNearbyAlerts);

// Admin routes
router.use(protectAdmin);
router.post('/', createAlert);
router.put('/:id', updateAlert);
router.delete('/:id', deleteAlert);

module.exports = router;
