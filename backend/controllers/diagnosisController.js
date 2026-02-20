const { supabase } = require('../config/supabase');

// Get all diagnosis for a patient
const getDiagnosisByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const { data: diagnosis, error } = await supabase
      .from('patient_diagnosis')
      .select(`
        *,
        patients (
          first_name,
          last_name
        )
      `)
      .eq('patient_id', patientId)
      .order('diagnosed_date', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { diagnosis: diagnosis || [] }
    });
  } catch (error) {
    console.error('Get diagnosis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diagnosis'
    });
  }
};

// Get single diagnosis record
const getDiagnosisById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: diagnosis, error } = await supabase
      .from('patient_diagnosis')
      .select(`
        *,
        patients (
          first_name,
          last_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found'
      });
    }

    res.json({
      success: true,
      data: { diagnosis }
    });
  } catch (error) {
    console.error('Get diagnosis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch diagnosis'
    });
  }
};

// Create new diagnosis
const createDiagnosis = async (req, res) => {
  try {
    const {
      patientId,
      doctorId,
      appointmentId,
      diagnosisCode,
      diagnosisName,
      diagnosisType,
      severity,
      status,
      symptoms,
      clinicalNotes,
      treatmentPlan,
      followUpRequired,
      followUpDate,
      diagnosedDate
    } = req.body;

    if (!patientId || !diagnosisName) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID and diagnosis name are required'
      });
    }

    const { data: diagnosis, error } = await supabase
      .from('patient_diagnosis')
      .insert([{
        patient_id: patientId,
        doctor_id: doctorId || null,
        appointment_id: appointmentId || null,
        diagnosis_code: diagnosisCode || null,
        diagnosis_name: diagnosisName,
        diagnosis_type: diagnosisType || null,
        severity: severity || null,
        status: status || 'Active',
        symptoms: symptoms || null,
        clinical_notes: clinicalNotes || null,
        treatment_plan: treatmentPlan || null,
        follow_up_required: followUpRequired || false,
        follow_up_date: followUpDate || null,
        diagnosed_date: diagnosedDate || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Diagnosis created successfully',
      data: { diagnosis }
    });
  } catch (error) {
    console.error('Create diagnosis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create diagnosis'
    });
  }
};

// Update diagnosis
const updateDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };

    // Convert camelCase to snake_case
    const dbData = {};
    Object.keys(updateData).forEach(key => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbData[snakeKey] = updateData[key];
    });

    const { data: diagnosis, error } = await supabase
      .from('patient_diagnosis')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!diagnosis) {
      return res.status(404).json({
        success: false,
        message: 'Diagnosis not found'
      });
    }

    res.json({
      success: true,
      message: 'Diagnosis updated successfully',
      data: { diagnosis }
    });
  } catch (error) {
    console.error('Update diagnosis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update diagnosis'
    });
  }
};

// Delete diagnosis
const deleteDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('patient_diagnosis')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Diagnosis deleted successfully'
    });
  } catch (error) {
    console.error('Delete diagnosis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete diagnosis'
    });
  }
};

module.exports = {
  getDiagnosisByPatient,
  getDiagnosisById,
  createDiagnosis,
  updateDiagnosis,
  deleteDiagnosis
};
