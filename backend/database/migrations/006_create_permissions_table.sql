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
