const { supabase } = require('../config/supabase');
const { cache } = require('../config/redis');

// Create prescription
const createPrescription = async (req, res) => {
  try {
    const { 
      accessToken, 
      medicationName, 
      dosage, 
      frequency, 
      duration, 
      prescribedBy,
      prescribedDate,
      instructions,
      refills 
    } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token required'
      });
    }

    if (!medicationName || !dosage || !frequency) {
      return res.status(400).json({
        success: false,
        message: 'Medication name, dosage, and frequency are required'
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

    const prescriptionData = {
      user_id: user.id,
      medication_name: medicationName,
      dosage,
      frequency,
      duration: duration || null,
      prescribed_by: prescribedBy || null,
      prescribed_date: prescribedDate || new Date().toISOString().split('T')[0],
      instructions: instructions || null,
      refills: refills || 0,
      status: 'active'
    };

    const { data: prescription, error: prescriptionError } = await supabaseWithToken
      .from('prescriptions')
      .insert(prescriptionData)
      .select()
      .single();

    if (prescriptionError) {
      if (prescriptionError.message.includes('does not exist') || 
          prescriptionError.message.includes('schema cache')) {
        return res.status(400).json({
          success: false,
          message: 'Prescriptions table not created yet. Please run database migrations first.',
          hint: 'Go to Supabase Dashboard → SQL Editor and run the prescriptions table migration'
        });
      }
      throw prescriptionError;
    }

    // Clear cache
    await cache.delPattern(`prescriptions:${user.id}:*`);

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      data: { prescription }
    });

  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating prescription'
    });
  }
};

// Get prescriptions with pagination
const getPrescriptions = async (req, res) => {
  try {
    const { accessToken, page = 1, limit = 10, status } = req.body;

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

    // Check cache
    const cacheKey = `prescriptions:${user.id}:${page}:${limit}:${status || 'all'}`;
    const cachedData = await cache.get(cacheKey);
    
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // Build query
    let query = supabaseWithToken
      .from('prescriptions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    if (status) {
      query = query.eq('status', status);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: prescriptions, error: prescriptionsError, count } = await query
      .order('created_at', { ascending: false })
      .order('prescribed_date', { ascending: false })
      .range(from, to);

    if (prescriptionsError) {
      if (prescriptionsError.message.includes('does not exist') || 
          prescriptionsError.message.includes('schema cache')) {
        return res.status(200).json({
          success: true,
          data: { 
            prescriptions: [], 
            pagination: { page: 1, limit, total: 0, totalPages: 0 }
          },
          message: 'Prescriptions table not created yet'
        });
      }
      throw prescriptionsError;
    }

    const totalPages = Math.ceil(count / limit);
    const responseData = {
      prescriptions: prescriptions || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages
      }
    };

    // Cache for 5 minutes
    await cache.set(cacheKey, responseData, 300);

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching prescriptions'
    });
  }
};

// Update prescription
const updatePrescription = async (req, res) => {
  try {
    const { 
      accessToken, 
      prescriptionId, 
      medicationName, 
      dosage, 
      frequency, 
      duration,
      prescribedBy,
      prescribedDate,
      instructions,
      refills,
      status 
    } = req.body;

    if (!accessToken || !prescriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Access token and prescription ID required'
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
      medication_name: medicationName,
      dosage,
      frequency,
      duration,
      prescribed_by: prescribedBy,
      prescribed_date: prescribedDate,
      instructions,
      refills,
      status: status || 'active',
      updated_at: new Date().toISOString()
    };

    const { data: prescription, error: updateError } = await supabaseWithToken
      .from('prescriptions')
      .update(updateData)
      .eq('id', prescriptionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Clear cache
    await cache.delPattern(`prescriptions:${user.id}:*`);

    res.status(200).json({
      success: true,
      message: 'Prescription updated successfully',
      data: { prescription }
    });

  } catch (error) {
    console.error('Update prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating prescription'
    });
  }
};

// Delete prescription
const deletePrescription = async (req, res) => {
  try {
    const { accessToken, prescriptionId } = req.body;

    if (!accessToken || !prescriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Access token and prescription ID required'
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
      .from('prescriptions')
      .delete()
      .eq('id', prescriptionId)
      .eq('user_id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    // Clear cache
    await cache.delPattern(`prescriptions:${user.id}:*`);

    res.status(200).json({
      success: true,
      message: 'Prescription deleted successfully'
    });

  } catch (error) {
    console.error('Delete prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting prescription'
    });
  }
};

module.exports = {
  createPrescription,
  getPrescriptions,
  updatePrescription,
  deletePrescription
};
