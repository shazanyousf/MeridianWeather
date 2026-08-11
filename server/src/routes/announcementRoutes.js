/**
 * Announcement Routes
 */

const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/auth');
const {
  getActiveAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');

// Public
router.get('/', getActiveAnnouncements);

// Admin
router.get('/all', protectAdmin, getAllAnnouncements);
router.post('/', protectAdmin, createAnnouncement);
router.put('/:id', protectAdmin, updateAnnouncement);
router.delete('/:id', protectAdmin, deleteAnnouncement);

module.exports = router;
