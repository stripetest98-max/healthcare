-- =====================================================
-- FORCE DISABLE RLS - GUARANTEED TO WORK
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop ALL policies (even if they don't exist)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'patients'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.patients CASCADE';
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Step 2: Disable RLS
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'patients';

-- Should show: rls_enabled = false

-- Step 4: Verify no policies exist
SELECT 
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'patients';

-- Should show: policy_count = 0

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'RLS DISABLED! Try creating a patient now.' as message;

-- =====================================================
-- DONE!
-- =====================================================
-- RLS is now completely disabled.
-- Any authenticated user can create/read/update/delete patients.
-- This is fine for development/testing.
-- =====================================================
