-- ============================================
-- ROLES & PERMISSIONS TABLES
-- Copy and paste this into Supabase SQL Editor
-- ============================================

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

-- ============================================

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

-- ============================================
-- DONE! Tables created successfully
-- ============================================
