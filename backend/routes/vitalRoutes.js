const express = require('express');
const router = express.Router();
const {
  getVitalsByPatient,
  getVitalById,
  createVital,
  updateVital,
  deleteVital
} = require('../controllers/vitalController');

// Vital routes
router.get('/patient/:patientId', getVitalsByPatient);
router.get('/:id', getVitalById);
router.post('/', createVital);
router.put('/:id', updateVital);
router.delete('/:id', deleteVital);

module.exports = router;
