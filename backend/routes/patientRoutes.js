const express = require('express');
const router = express.Router();
const {
  getPatients,
  getPatientById,
  getPatientByUserId,
  createPatient,
  updatePatient,
  deletePatient
} = require('../controllers/patientController');

// Patient routes
router.get('/', getPatients);
router.get('/:id', getPatientById);
router.get('/user/:userId', getPatientByUserId);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

module.exports = router;
