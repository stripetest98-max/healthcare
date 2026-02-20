-- =====================================================
-- COMPLETE DATABASE FIX - RUN THIS IN SUPABASE
-- This fixes ALL errors including profiles.role issue
-- Copy and paste this ENTIRE file into Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: CREATE ROLES TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('Admin', 'Full system access with all permissions'),
  ('Doctor', 'Medical staff with patient management access'),
  ('Nurse', 'Nursing staff with limited patient access'),
  ('Receptionist', 'Front desk staff with appointment management'),
  ('Patient', 'Patient with personal health record access')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- STEP 2: ADD role_id TO PROFILES TABLE
-- =====================================================

-- Add role_id column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);

-- =====================================================
-- STEP 3: CREATE PATIENTS TABLE (FIXED VERSION)
-- =====================================================

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Demographics
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
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relation VARCHAR(50),
  
  -- Medical Info
  allergies TEXT,
  chronic_conditions TEXT,
  current_medications TEXT,
  
  -- Insurance
  insurance_provider VARCHAR(200),
  insurance_policy_number VARCHAR(100),
  
  -- System fields
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- Enable RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own patient record" ON patients;
DROP POLICY IF EXISTS "Users can update their own patient record" ON patients;
DROP POLICY IF EXISTS "Admins and doctors can view all patients" ON patients;
DROP POLICY IF EXISTS "Healthcare staff can view all patients" ON patients;
DROP POLICY IF EXISTS "Admins and receptionists can insert patients" ON patients;
DROP POLICY IF EXISTS "Admins can update any patient" ON patients;

-- Create NEW policies with FIXED role checking
CREATE POLICY "Users can view their own patient record" ON patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own patient record" ON patients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Healthcare staff can view all patients" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN roles ON profiles.role_id = roles.id
      WHERE profiles.id = auth.uid()
      AND roles.name IN ('Admin', 'Doctor', 'Nurse', 'Receptionist')
    )
  );

CREATE POLICY "Admins and receptionists can insert patients" ON patients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN roles ON profiles.role_id = roles.id
      WHERE profiles.id = auth.uid()
      AND roles.name IN ('Admin', 'Receptionist')
    )
  );

CREATE POLICY "Admins can update any patient" ON patients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN roles ON profiles.role_id = roles.id
      WHERE profiles.id = auth.uid()
      AND roles.name = 'Admin'
    )
  );

-- =====================================================
-- STEP 4: CREATE PATIENT VITALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS patient_vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES auth.users(id),
  
  -- Vital Signs
  temperature DECIMAL(4,1),
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  respiratory_rate INTEGER,
  oxygen_saturation DECIMAL(5,2),
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(5,2),
  blood_sugar DECIMAL(5,2),
  pulse INTEGER,
  
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_vitals_patient_id ON patient_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_vitals_recorded_at ON patient_vitals(recorded_at DESC);

ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Patients can view their own vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Healthcare staff can view all vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Healthcare staff can insert vitals" ON patient_vitals;
DROP POLICY IF EXISTS "Healthcare staff can update vitals" ON patient_vitals;

-- Create NEW policies
CREATE POLICY "Patients can view their own vitals" ON patient_vitals
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Healthcare staff can view all vitals" ON patient_vitals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN roles ON profiles.role_id = roles.id
      WHERE profiles.id = auth.uid()
      AND roles.name IN ('Admin', 'Doctor', 'Nurse')
    )
  );

CREATE POLICY "Healthcare staff can insert vitals" ON patient_vitals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN roles ON profiles.role_id = roles.id
      WHERE profiles.id = auth.uid()
      AND roles.name IN ('Admin', 'Doctor', 'Nurse')
    )
  );

CREATE POLICY "Healthcare staff can update vitals" ON patient_vitals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN roles ON profiles.role_id = roles.id
      WHERE profiles.id = auth.uid()
      AND roles.name IN ('Admin', 'Doctor', 'Nurse')
    )
  );

-- =====================================================
-- STEP 5: CREATE PATIENT DIAGNOSIS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS patient_diagnosis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id),
  appointment_id UUID REFERENCES appointments(id),
  
  diagnosis_code VARCHAR(20),
  diagnosis_name VARCHAR(500) NOT NULL,
  diagnosis_type VARCHAR(50),
  severity VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Active',
  
  symptoms TEXT,
  clinical_notes TEXT,
  treatment_plan TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  
  diagnosed_date DATE DEFAULT CURRENT_DATE,
  resolved_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_diagnosis_patient_id ON patient_diagnosis(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_diagnosis_doctor_id ON patient_diagnosis(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_diagnosis_status ON patient_diagnosis(status);
CREATE INDEX IF NOT EXISTS idx_patient_diagnosis_date ON patient_diagnosis(diagnosed_date DESC);

ALTER TABLE patient_diagnosis ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Patients can view their own diagnosis" ON patient_diagnosis;
DROP POLICY IF EXISTS "Healthcare staff can view all diagnosis" ON patient_diagnosis;
DROP POLICY IF EXISTS "Doctors can insert diagnosis" ON patient_diagnosis;
DROP POLICY IF EXISTS "Doctors can update diagnosis" ON patient_diagnosis;

-- Create NEW policies
CREATE POLICY "Patients can view their own diagnosis" ON patient_diagnosis
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Healthcare staff can view all diagnosis" ON patient_diagnosis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN roles ON profiles.role_id = roles.id
      WHERE profiles.id = auth.uid()
      AND roles.name IN ('Admin', 'Doctor', 'Nurse')
    )
  );

CREATE POLICY "Doctors can insert diagnosis" ON patient_diagnosis
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN roles ON profiles.role_id = roles.id
      WHERE profiles.id = auth.uid()
      AND roles.name IN ('Admin', 'Doctor')
    )
  );

CREATE POLICY "Doctors can update diagnosis" ON patient_diagnosis
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN roles ON profiles.role_id = roles.id
      WHERE profiles.id = auth.uid()
      AND roles.name IN ('Admin', 'Doctor')
    )
  );

-- =====================================================
-- STEP 6: ASSIGN ADMIN ROLE TO YOUR USER
-- =====================================================

-- Option 1: Assign Admin to currently logged-in user
-- Uncomment this if you're logged in:
-- UPDATE profiles 
-- SET role_id = (SELECT id FROM roles WHERE name = 'Admin')
-- WHERE id = auth.uid();

-- Option 2: Assign Admin to specific user by ID
-- First, find your user ID:
-- SELECT id, full_name FROM profiles;
-- Then replace 'YOUR_USER_ID_HERE' with your actual user ID:
-- UPDATE profiles 
-- SET role_id = (SELECT id FROM roles WHERE name = 'Admin')
-- WHERE id = 'YOUR_USER_ID_HERE';

-- Option 3: Assign Admin to ALL users (for testing only!)
-- Uncomment this to give everyone Admin role:
-- UPDATE profiles 
-- SET role_id = (SELECT id FROM roles WHERE name = 'Admin')
-- WHERE role_id IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created
SELECT 
  'patients' as table_name, 
  COUNT(*) as row_count 
FROM patients
UNION ALL
SELECT 
  'patient_vitals' as table_name, 
  COUNT(*) as row_count 
FROM patient_vitals
UNION ALL
SELECT 
  'patient_diagnosis' as table_name, 
  COUNT(*) as row_count 
FROM patient_diagnosis;

-- Check roles
SELECT * FROM roles ORDER BY name;

-- Check users and their roles
SELECT 
  p.id,
  p.full_name,
  r.name as role
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
ORDER BY p.created_at DESC;

-- =====================================================
-- SUCCESS!
-- =====================================================
-- If you see no errors above, everything is set up!
-- Now:
-- 1. Uncomment ONE of the UPDATE statements in STEP 6
-- 2. Run this file again to assign Admin role
-- 3. Refresh your app
-- 4. Try creating a patient - it will work!
-- =====================================================
