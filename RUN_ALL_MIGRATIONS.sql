-- =====================================================
-- COMPLETE DATABASE SETUP - ALL MIGRATIONS
-- Copy and paste this entire SQL into Supabase SQL Editor
-- Run this ONCE to set up all tables
-- =====================================================

-- =====================================================
-- MIGRATION 001: PROFILES TABLE
-- =====================================================

-- Create profiles table to extend user data
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  blood_group TEXT,
  allergies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- MIGRATION 002: APPOINTMENTS TABLE
-- =====================================================

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_specialty TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments"
  ON public.appointments FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.appointments;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS appointments_user_id_idx ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS appointments_date_idx ON public.appointments(appointment_date);

-- =====================================================
-- MIGRATION 003: PRESCRIPTIONS TABLE
-- =====================================================

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  prescribed_by TEXT,
  prescribed_date DATE DEFAULT CURRENT_DATE,
  instructions TEXT,
  refills INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can create their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can update their own prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can delete their own prescriptions" ON public.prescriptions;

-- Create policies
CREATE POLICY "Users can view their own prescriptions"
  ON public.prescriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own prescriptions"
  ON public.prescriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescriptions"
  ON public.prescriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescriptions"
  ON public.prescriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.prescriptions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS prescriptions_user_id_idx ON public.prescriptions(user_id);
CREATE INDEX IF NOT EXISTS prescriptions_status_idx ON public.prescriptions(status);
CREATE INDEX IF NOT EXISTS prescriptions_date_idx ON public.prescriptions(prescribed_date);

-- =====================================================
-- MIGRATION 004: LAB REPORTS TABLE
-- =====================================================

-- Create lab_reports table
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_name TEXT NOT NULL,
  test_type TEXT,
  lab_name TEXT,
  test_date DATE NOT NULL,
  result TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  report_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own lab reports"
  ON public.lab_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lab reports"
  ON public.lab_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lab reports"
  ON public.lab_reports FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.lab_reports;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.lab_reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS lab_reports_user_id_idx ON public.lab_reports(user_id);
CREATE INDEX IF NOT EXISTS lab_reports_test_date_idx ON public.lab_reports(test_date);

-- =====================================================
-- MIGRATION 005: ROLES TABLE
-- =====================================================

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('Admin', 'Full system access with all permissions'),
  ('Doctor', 'Medical staff with patient management access'),
  ('Nurse', 'Nursing staff with limited patient access'),
  ('Receptionist', 'Front desk staff with appointment management'),
  ('Patient', 'Patient with personal health record access')
ON CONFLICT (name) DO NOTHING;

-- Add role_id to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id);

-- Create index on role_id
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);

-- =====================================================
-- MIGRATION 006: PERMISSIONS TABLE
-- =====================================================

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  section VARCHAR(100) NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  is_own BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, section)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_permissions_role_id ON permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_section ON permissions(section);

-- Insert default permissions for Admin role
INSERT INTO permissions (role_id, section, can_view, can_edit, can_delete, is_own)
SELECT 
  r.id,
  section_name,
  true,
  true,
  true,
  false
FROM roles r
CROSS JOIN (
  VALUES 
    ('Dashboard'),
    ('Appointments'),
    ('Prescriptions'),
    ('Lab Reports'),
    ('Patients'),
    ('Doctors'),
    ('Roles'),
    ('Permissions'),
    ('Settings')
) AS sections(section_name)
WHERE r.name = 'Admin'
ON CONFLICT (role_id, section) DO NOTHING;

-- Insert default permissions for Doctor role
INSERT INTO permissions (role_id, section, can_view, can_edit, can_delete, is_own)
SELECT 
  r.id,
  section_name,
  can_view,
  can_edit,
  can_delete,
  is_own
FROM roles r
CROSS JOIN (
  VALUES 
    ('Dashboard', true, false, false, false),
    ('Appointments', true, true, false, true),
    ('Prescriptions', true, true, true, true),
    ('Lab Reports', true, true, false, true),
    ('Patients', true, true, false, false)
) AS sections(section_name, can_view, can_edit, can_delete, is_own)
WHERE r.name = 'Doctor'
ON CONFLICT (role_id, section) DO NOTHING;

-- Insert default permissions for Patient role
INSERT INTO permissions (role_id, section, can_view, can_edit, can_delete, is_own)
SELECT 
  r.id,
  section_name,
  can_view,
  can_edit,
  can_delete,
  is_own
FROM roles r
CROSS JOIN (
  VALUES 
    ('Dashboard', true, false, false, false),
    ('Appointments', true, true, false, true),
    ('Prescriptions', true, false, false, true),
    ('Lab Reports', true, false, false, true)
) AS sections(section_name, can_view, can_edit, can_delete, is_own)
WHERE r.name = 'Patient'
ON CONFLICT (role_id, section) DO NOTHING;

-- =====================================================
-- MIGRATION 007: PATIENTS TABLE
-- =====================================================

-- Create patients table
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own patient record" ON patients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own patient record" ON patients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins and doctors can view all patients" ON patients
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
-- MIGRATION 008: PATIENT VITALS TABLE
-- =====================================================

-- Create patient vitals table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patient_vitals_patient_id ON patient_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_vitals_recorded_at ON patient_vitals(recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;

-- Create policies
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
-- MIGRATION 009: PATIENT DIAGNOSIS TABLE
-- =====================================================

-- Create patient diagnosis table
CREATE TABLE IF NOT EXISTS patient_diagnosis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id),
  appointment_id UUID REFERENCES appointments(id),
  
  -- Diagnosis Information
  diagnosis_code VARCHAR(20),
  diagnosis_name VARCHAR(500) NOT NULL,
  diagnosis_type VARCHAR(50),
  severity VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Active',
  
  -- Clinical Details
  symptoms TEXT,
  clinical_notes TEXT,
  treatment_plan TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  
  -- Dates
  diagnosed_date DATE DEFAULT CURRENT_DATE,
  resolved_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patient_diagnosis_patient_id ON patient_diagnosis(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_diagnosis_doctor_id ON patient_diagnosis(doctor_id);
CREATE INDEX IF NOT EXISTS idx_patient_diagnosis_status ON patient_diagnosis(status);
CREATE INDEX IF NOT EXISTS idx_patient_diagnosis_date ON patient_diagnosis(diagnosed_date DESC);

-- Enable Row Level Security
ALTER TABLE patient_diagnosis ENABLE ROW LEVEL SECURITY;

-- Create policies
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
-- SETUP COMPLETE!
-- =====================================================
-- All tables have been created with proper RLS policies
-- Default roles and permissions have been inserted
-- You can now use the application
-- =====================================================
