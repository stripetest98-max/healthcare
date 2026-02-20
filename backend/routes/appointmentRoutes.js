const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');

// Appointment routes
router.post('/create', createAppointment);
router.post('/list', getAppointments);
router.post('/update', updateAppointment);
router.post('/delete', deleteAppointment);

module.exports = router;
