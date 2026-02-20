-- =====================================================
-- PATIENTS MODULE - DATABASE SETUP
-- Copy and paste this entire SQL into Supabase SQL Editor
-- =====================================================

-- 1. CREATE PATIENTS TABLE
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

CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_phone ON patients(phone);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

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

-- 2. CREATE PATIENT VITALS TABLE
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

CREATE INDEX idx_patient_vitals_patient_id ON patient_vitals(patient_id);
CREATE INDEX idx_patient_vitals_recorded_at ON patient_vitals(recorded_at DESC);

ALTER TABLE patient_vitals ENABLE ROW LEVEL SECURITY;

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

-- 3. CREATE PATIENT DIAGNOSIS TABLE
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

CREATE INDEX idx_patient_diagnosis_patient_id ON patient_diagnosis(patient_id);
CREATE INDEX idx_patient_diagnosis_doctor_id ON patient_diagnosis(doctor_id);
CREATE INDEX idx_patient_diagnosis_status ON patient_diagnosis(status);
CREATE INDEX idx_patient_diagnosis_date ON patient_diagnosis(diagnosed_date DESC);

ALTER TABLE patient_diagnosis ENABLE ROW LEVEL SECURITY;

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
