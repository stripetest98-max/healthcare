const { supabase } = require('../config/supabase');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token required'
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

    // Try to get profile from profiles table
    let profile = null;
    try {
      const { data, error: profileError } = await supabaseWithToken
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If table doesn't exist or no profile found, that's okay
      if (!profileError || profileError.code === 'PGRST116') {
        profile = data;
      } else if (profileError.message.includes('does not exist') || 
                 profileError.message.includes('schema cache')) {
        // Table doesn't exist yet - return user data only
        console.log('Profiles table not created yet');
      } else {
        throw profileError;
      }
    } catch (err) {
      console.log('Profile fetch error (table may not exist):', err.message);
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile: profile || null
      },
      message: profile ? 'Profile loaded' : 'Profile table not created yet. Please run database migrations.'
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// Create or update profile
const updateProfile = async (req, res) => {
  try {
    const { accessToken, fullName, phone, dateOfBirth, gender, address, city, state, zipCode, emergencyContactName, emergencyContactPhone, bloodGroup, allergies } = req.body;

    // Validation
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Validate phone number (if provided)
    if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits'
      });
    }

    // Validate gender (if provided)
    if (gender && !['male', 'female', 'other'].includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Gender must be male, female, or other'
      });
    }

    // Validate zip code (if provided)
    if (zipCode && !/^\d{5,6}$/.test(zipCode)) {
      return res.status(400).json({
        success: false,
        message: 'Zip code must be 5-6 digits'
      });
    }

    // Validate emergency contact phone (if provided)
    if (emergencyContactPhone && !/^\d{10}$/.test(emergencyContactPhone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Emergency contact phone must be 10 digits'
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

    // Prepare profile data
    const profileData = {
      id: user.id,
      full_name: fullName || null,
      phone: phone || null,
      date_of_birth: dateOfBirth || null,
      gender: gender ? gender.toLowerCase() : null,
      address: address || null,
      city: city || null,
      state: state || null,
      zip_code: zipCode || null,
      emergency_contact_name: emergencyContactName || null,
      emergency_contact_phone: emergencyContactPhone || null,
      blood_group: bloodGroup || null,
      allergies: allergies || [],
      updated_at: new Date().toISOString()
    };

    // Try to upsert profile
    try {
      const { data: profile, error: profileError } = await supabaseWithToken
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      if (profileError) {
        // Check if table doesn't exist
        if (profileError.message.includes('does not exist') || 
            profileError.message.includes('schema cache')) {
          return res.status(400).json({
            success: false,
            message: 'Profiles table not created yet. Please run database migrations first.',
            hint: 'Go to Supabase Dashboard → SQL Editor and run the profiles table migration'
          });
        }
        throw profileError;
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { profile }
      });

    } catch (err) {
      console.error('Profile update error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to update profile'
      });
    }

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// Delete profile
const deleteProfile = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Access token required'
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

    // Try to delete profile
    try {
      const { error: deleteError } = await supabaseWithToken
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (deleteError) {
        // Check if table doesn't exist
        if (deleteError.message.includes('does not exist') || 
            deleteError.message.includes('schema cache')) {
          return res.status(400).json({
            success: false,
            message: 'Profiles table not created yet. Nothing to delete.',
            hint: 'Create profiles table first by running database migrations'
          });
        }
        throw deleteError;
      }

      res.status(200).json({
        success: true,
        message: 'Profile deleted successfully'
      });

    } catch (err) {
      console.error('Profile delete error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to delete profile'
      });
    }

  } catch (error) {
    console.error('Delete profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting profile'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile
};
