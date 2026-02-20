const { supabase } = require('../config/supabase');

// Create appointment
const createAppointment = async (req, res) => {
  try {
    const { accessToken, doctorName, doctorSpecialty, appointmentDate, appointmentTime, reason, notes } = req.body;

    // Validation
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token required'
      });
    }

    if (!doctorName || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Doctor name, date, and time are required'
      });
    }

    // Create Supabase client with user token
    const { createClient } = require('@supabase/supabase-js');
    const supabaseWithToken = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );

    // Get user
    const { data: { user }, error: userError } = await supabaseWithToken.auth.getUser();

    if (userError) {
      return res.status(401).json({
        success: false,
        message: userError.message
      });
    }

    // Create appointment
    const appointmentData = {
      user_id: user.id,
      doctor_name: doctorName,
      doctor_specialty: doctorSpecialty || null,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: 'scheduled',
      reason: reason || null,
      notes: notes || null
    };

    const { data: appointment, error: appointmentError } = await supabaseWithToken
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (appointmentError) {
      if (appointmentError.message.includes('does not exist') || 
          appointmentError.message.includes('schema cache')) {
        return res.status(400).json({
          success: false,
          message: 'Appointments table not created yet. Please run database migrations first.',
          hint: 'Go to Supabase Dashboard → SQL Editor and run the appointments table migration'
        });
      }
      throw appointmentError;
    }

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { appointment }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating appointment'
    });
  }
};

// Get all appointments for user
const getAppointments = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token required'
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabaseWithToken = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );

    const { data: { user }, error: userError } = await supabaseWithToken.auth.getUser();

    if (userError) {
      return res.status(401).json({
        success: false,
        message: userError.message
      });
    }

    const { data: appointments, error: appointmentsError } = await supabaseWithToken
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    if (appointmentsError) {
      if (appointmentsError.message.includes('does not exist') || 
          appointmentsError.message.includes('schema cache')) {
        return res.status(200).json({
          success: true,
          data: { appointments: [] },
          message: 'Appointments table not created yet'
        });
      }
      throw appointmentsError;
    }

    res.status(200).json({
      success: true,
      data: { appointments: appointments || [] }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const { accessToken, appointmentId, doctorName, doctorSpecialty, appointmentDate, appointmentTime, status, reason, notes } = req.body;

    if (!accessToken || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Access token and appointment ID required'
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabaseWithToken = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );

    const { data: { user }, error: userError } = await supabaseWithToken.auth.getUser();

    if (userError) {
      return res.status(401).json({
        success: false,
        message: userError.message
      });
    }

    const updateData = {
      doctor_name: doctorName,
      doctor_specialty: doctorSpecialty,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: status || 'scheduled',
      reason: reason,
      notes: notes,
      updated_at: new Date().toISOString()
    };

    const { data: appointment, error: updateError } = await supabaseWithToken
      .from('appointments')
      .update(updateData)
      .eq('id', appointmentId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment }
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating appointment'
    });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const { accessToken, appointmentId } = req.body;

    if (!accessToken || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Access token and appointment ID required'
      });
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabaseWithToken = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    );

    const { data: { user }, error: userError } = await supabaseWithToken.auth.getUser();

    if (userError) {
      return res.status(401).json({
        success: false,
        message: userError.message
      });
    }

    const { error: deleteError } = await supabaseWithToken
      .from('appointments')
      .delete()
      .eq('id', appointmentId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting appointment'
    });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment,
  deleteAppointment
};
