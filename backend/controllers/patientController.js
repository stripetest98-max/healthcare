const { supabase } = require('../config/supabase');

// Get all patients
const getPatients = async (req, res) => {
  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { patients: patients || [] }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients'
    });
  }
};

// Get single patient by ID
const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: { patient }
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient'
    });
  }
};

// Get patient by user ID
const getPatientByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({
      success: true,
      data: { patient: patient || null }
    });
  } catch (error) {
    console.error('Get patient by user ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient'
    });
  }
};

// Create new patient
const createPatient = async (req, res) => {
  try {
    const {
      userId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      phone,
      email,
      address,
      city,
      state,
      postalCode,
      country,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      allergies,
      chronicConditions,
      currentMedications,
      insuranceProvider,
      insurancePolicyNumber
    } = req.body;

    if (!firstName || !lastName || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and date of birth are required'
      });
    }

    const { data: patient, error } = await supabase
      .from('patients')
      .insert([{
        user_id: userId || null,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dateOfBirth,
        gender: gender || null,
        blood_group: bloodGroup || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        city: city || null,
        state: state || null,
        postal_code: postalCode || null,
        country: country || null,
        emergency_contact_name: emergencyContactName || null,
        emergency_contact_phone: emergencyContactPhone || null,
        emergency_contact_relation: emergencyContactRelation || null,
        allergies: allergies || null,
        chronic_conditions: chronicConditions || null,
        current_medications: currentMedications || null,
        insurance_provider: insuranceProvider || null,
        insurance_policy_number: insurancePolicyNumber || null
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: { patient }
    });
  } catch (error) {
    console.error('Create patient error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      message: 'Failed to create patient',
      error: error.message || 'Unknown error'
    });
  }
};

// Update patient
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updated_at: new Date().toISOString() };

    // Convert camelCase to snake_case for database
    const dbData = {};
    Object.keys(updateData).forEach(key => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbData[snakeKey] = updateData[key];
    });

    const { data: patient, error } = await supabase
      .from('patients')
      .update(dbData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: { patient }
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update patient'
    });
  }
};

// Delete patient
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient'
    });
  }
};

module.exports = {
  getPatients,
  getPatientById,
  getPatientByUserId,
  createPatient,
  updatePatient,
  deletePatient
};
