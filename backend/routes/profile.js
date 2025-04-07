const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Import controller methods
const {
  getProfile,
  updateProfile,
  updateAvatar,
  getAvatar
} = require('../controllers/profile');

// All routes are protected
router.use(protect);

// Get and update profile routes
router.route('/')
  .get(getProfile)
  .put(updateProfile);

// Update avatar route with file upload
router.put('/avatar', upload.single('avatar'), updateAvatar);

// Get avatar route
router.get('/avatar', getAvatar);
router.get('/avatar/:id', getAvatar);

module.exports = router; 