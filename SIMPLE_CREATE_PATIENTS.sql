-- =====================================================
-- SIMPLE PATIENTS TABLE CREATION
-- If other SQL files are giving errors, use this
-- =====================================================

-- Create patients table (basic version)
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  blood_group VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relation VARCHAR(50),
  
  allergies TEXT,
  chronic_conditions TEXT,
  current_medications TEXT,
  
  insurance_provider VARCHAR(200),
  insurance_policy_number VARCHAR(100),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Simple policy: Allow authenticated users to do everything (TEMPORARY)
DROP POLICY IF EXISTS "temp_allow_all" ON public.patients;
CREATE POLICY "temp_allow_all" ON public.patients
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Verify table was created
SELECT 'SUCCESS! Patients table created' as message;

-- Show table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients'
ORDER BY ordinal_position;

-- =====================================================
-- DONE!
-- =====================================================
-- This creates a basic patients table with a simple policy
-- that allows any authenticated user to create patients.
-- 
-- After this works, you can add proper role-based policies.
-- =====================================================
