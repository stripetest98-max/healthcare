-- =====================================================
-- FIX RLS POLICY - Run this in Supabase SQL Editor
-- This fixes: "new row violates row-level security policy"
-- =====================================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "temp_allow_all" ON patients;

-- Create a new permissive policy for INSERT
CREATE POLICY "allow_authenticated_insert" ON patients
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy for SELECT (view)
CREATE POLICY "allow_authenticated_select" ON patients
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Create policy for UPDATE
CREATE POLICY "allow_authenticated_update" ON patients
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Create policy for DELETE
CREATE POLICY "allow_authenticated_delete" ON patients
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'patients';

-- =====================================================
-- DONE!
-- =====================================================
-- Now any authenticated user can create patients.
-- Try creating a patient in your app - it will work!
-- =====================================================
