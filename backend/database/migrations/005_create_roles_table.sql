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
