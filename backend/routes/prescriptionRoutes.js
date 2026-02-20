const express = require('express');
const router = express.Router();
const {
  createPrescription,
  getPrescriptions,
  updatePrescription,
  deletePrescription
} = require('../controllers/prescriptionController');

// Prescription routes
router.post('/create', createPrescription);
router.post('/list', getPrescriptions);
router.post('/update', updatePrescription);
router.post('/delete', deletePrescription);

module.exports = router;
