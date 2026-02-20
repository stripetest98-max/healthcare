const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  deleteProfile
} = require('../controllers/profileController');

// Profile routes
router.post('/get', getProfile);
router.post('/update', updateProfile);
router.post('/delete', deleteProfile);

module.exports = router;
