/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/auth');
const {
  adminLogin,
  getOverview,
  getUsers,
  getUserById,
  deleteUser,
  toggleBlockUser,
  promoteUser,
  getSearchStats,
  getApiUsage,
  getUserAnalytics,
  getAllFeedback,
  getAllAlerts,
  getAdmins,
  deleteAdmin,
} = require('../controllers/adminController');

// Public admin login
router.post('/login', adminLogin);

// All admin routes require admin auth
router.use(protectAdmin);

// Dashboard
router.get('/overview', getOverview);
router.get('/search-stats', getSearchStats);
router.get('/api-usage', getApiUsage);
router.get('/user-analytics', getUserAnalytics);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/block', toggleBlockUser);
router.put('/users/:id/promote', promoteUser);

// Content management
router.get('/feedback', getAllFeedback);
router.get('/alerts', getAllAlerts);

// Admin management
router.get('/admins', getAdmins);
router.delete('/admins/:id', deleteAdmin);

module.exports = router;
