-- Create patient vitals table
CREATE TABLE IF NOT EXISTS patient_vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES auth.users(id),
  
  -- Vital Signs
  temperature DECIMAL(4,1), -- in Celsius
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER, -- beats per minute
  respiratory_rate INTEGER, -- breaths per minute
  oxygen_saturation DECIMAL(5,2), -- SpO2 percentage
  weight DECIMAL(5,2), -- in kg
  height DECIMAL(5,2), -- in cm
  bmi DECIMAL(5,2), -- calculated
  
  -- Additional measurements
  blood_sugar DECIMAL(5,2), -- mg/dL
  pulse INTEGER,
  
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_patient_vitals_patient_id ON patient_vitals(patient_id);
CREATE INDEX idx_patient_vitals_recorded_at ON patient_vitals(recorded_at DESC);

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
