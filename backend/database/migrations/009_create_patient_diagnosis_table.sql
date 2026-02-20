-- Create patient diagnosis table
CREATE TABLE IF NOT EXISTS patient_diagnosis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id),
  appointment_id UUID REFERENCES appointments(id),
  
  -- Diagnosis Information
  diagnosis_code VARCHAR(20), -- ICD-10 code
  diagnosis_name VARCHAR(500) NOT NULL,
  diagnosis_type VARCHAR(50), -- Primary, Secondary, Differential
  severity VARCHAR(50), -- Mild, Moderate, Severe, Critical
  status VARCHAR(50) DEFAULT 'Active', -- Active, Resolved, Chronic, Under Observation
  
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
CREATE INDEX idx_patient_diagnosis_patient_id ON patient_diagnosis(patient_id);
CREATE INDEX idx_patient_diagnosis_doctor_id ON patient_diagnosis(doctor_id);
CREATE INDEX idx_patient_diagnosis_status ON patient_diagnosis(status);
CREATE INDEX idx_patient_diagnosis_date ON patient_diagnosis(diagnosed_date DESC);

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
