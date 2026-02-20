const { supabase } = require('../config/supabase');

// Get all vitals for a patient
const getVitalsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    const { data: vitals, error } = await supabase
      .from('patient_vitals')
      .select(`
        *,
        patients (
          first_name,
          last_name
        )
      `)
      .eq('patient_id', patientId)
      .order('recorded_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { vitals: vitals || [] }
    });
  } catch (error) {
    console.error('Get vitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vitals'
    });
  }
};

// Get single vital record
const getVitalById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: vital, error } = await supabase
      .from('patient_vitals')
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

    if (!vital) {
      return res.status(404).json({
        success: false,
        message: 'Vital record not found'
      });
    }

    res.json({
      success: true,
      data: { vital }
    });
  } catch (error) {
    console.error('Get vital error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vital'
    });
  }
};

// Create new vital record
const createVital = async (req, res) => {
  try {
    const {
      patientId,
      recordedBy,
      temperature,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      respiratoryRate,
      oxygenSaturation,
      weight,
      height,
      bmi,
      bloodSugar,
      pulse,
      notes
    } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID is required'
      });
    }

    const { data: vital, error } = await supabase
      .from('patient_vitals')
      .insert([{
        patient_id: patientId,
        recorded_by: recordedBy || null,
        temperature: temperature || null,
        blood_pressure_systolic: bloodPressureSystolic || null,
        blood_pressure_diastolic: bloodPressureDiastolic || null,
        heart_rate: heartRate || null,
        respiratory_rate: respiratoryRate || null,
        oxygen_saturation: oxygenSaturation || null,
        weight: weight || null,
        height: height || null,
        bmi: bmi || null,
        blood_sugar: bloodSugar || null,
        pulse: pulse || null,
        notes: notes || null
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Vital record created successfully',
      data: { vital }
    });
  } catch (error) {
    console.error('Create vital error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vital record'
    });
  }
};

// Update vital record
const updateVital = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };

    // Convert camelCase to snake_case
    const dbData = {};
    Object.keys(updateData).forEach(key => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbData[snakeKey] = updateData[key];
    });

    const { data: vital, error } = await supabase
      .from('patient_vitals')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!vital) {
      return res.status(404).json({
        success: false,
        message: 'Vital record not found'
      });
    }

    res.json({
      success: true,
      message: 'Vital record updated successfully',
      data: { vital }
    });
  } catch (error) {
    console.error('Update vital error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vital record'
    });
  }
};

// Delete vital record
const deleteVital = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('patient_vitals')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Vital record deleted successfully'
    });
  } catch (error) {
    console.error('Delete vital error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vital record'
    });
  }
};

module.exports = {
  getVitalsByPatient,
  getVitalById,
  createVital,
  updateVital,
  deleteVital
};
