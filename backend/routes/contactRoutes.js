const express = require('express');
const router = express.Router();
const { submitContactForm } = require('../controllers/contactController');

// POST /api/contact/submit
router.post('/submit', submitContactForm);

module.exports = router;
