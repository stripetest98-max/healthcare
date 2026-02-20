# Fixed: profiles.role Column Error

## Problem
SQL queries were failing with error:
```
ERROR: 42703: column profiles.role does not exist
```

## Root Cause
The `profiles` table uses `role_id` (UUID foreign key to roles table), not a `role` text column. The RLS policies were incorrectly checking `profiles.role` directly.

## Solution
Updated all RLS policies to:
1. JOIN with the `roles` table using `profiles.role_id = roles.id`
2. Check `roles.name` instead of `profiles.role`
3. Use proper role names with capitalization (e.g., 'Admin', 'Doctor', 'Nurse')

## Files Fixed

### 1. CREATE_PATIENTS_TABLES.sql
- ✅ All 9 policies updated with JOIN syntax

### 2. backend/database/migrations/007_create_patients_table.sql
- ✅ 3 policies updated (view, insert, update)

### 3. backend/database/migrations/008_create_patient_vitals_table.sql
- ✅ 3 policies updated (view, insert, update)

### 4. backend/database/migrations/009_create_patient_diagnosis_table.sql
- ✅ 3 policies updated (view, insert, update)

## Example Fix

### Before (Incorrect):
```sql
CREATE POLICY "Healthcare staff can view all patients" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'doctor', 'nurse')
    )
  );
```

### After (Correct):
```sql
CREATE POLICY "Healthcare staff can view all patients" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      JOIN roles ON profiles.role_id = roles.id
      WHERE profiles.id = auth.uid()
      AND roles.name IN ('Admin', 'Doctor', 'Nurse', 'Receptionist')
    )
  );
```

## Role Names Used
- Admin
- Doctor
- Nurse
- Receptionist
- Patient

## Next Steps
1. Copy the updated SQL from `CREATE_PATIENTS_TABLES.sql` into Supabase SQL Editor
2. Run the SQL to create/update the tables with correct policies
3. Ensure you have already run the roles migration (005_create_roles_table.sql) first
4. Test the policies by logging in with different user roles

## Important Notes
- The `role_id` column is added to profiles table in migration 005
- Make sure to run migrations in order: 001 → 005 → 007 → 008 → 009
- Role names are case-sensitive and use title case (Admin, not admin)
