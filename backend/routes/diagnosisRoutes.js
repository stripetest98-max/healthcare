const express = require('express');
const router = express.Router();
const {
  getDiagnosisByPatient,
  getDiagnosisById,
  createDiagnosis,
  updateDiagnosis,
  deleteDiagnosis
} = require('../controllers/diagnosisController');

// Diagnosis routes
router.get('/patient/:patientId', getDiagnosisByPatient);
router.get('/:id', getDiagnosisById);
router.post('/', createDiagnosis);
router.put('/:id', updateDiagnosis);
router.delete('/:id', deleteDiagnosis);

module.exports = router;
