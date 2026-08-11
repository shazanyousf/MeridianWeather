/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const {
  getMe,
  updateProfile,
  uploadProfileImage,
  updatePreferences,
  changePassword,
  deleteAccount,
  getDashboard,
} = require('../controllers/userController');

// Multer config for profile image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`),
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    const isAllowed = allowedTypes.test(ext);
    if (isAllowed) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// All routes require authentication
router.use(protect);

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.post('/profile-image', upload.single('image'), uploadProfileImage);
router.put('/preferences', updatePreferences);
router.put('/change-password', changePassword);
router.delete('/account', deleteAccount);
router.get('/dashboard', getDashboard);

module.exports = router;
