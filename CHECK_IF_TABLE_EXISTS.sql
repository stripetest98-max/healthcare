-- =====================================================
-- CHECK IF PATIENTS TABLE EXISTS
-- Run this in Supabase SQL Editor to verify
-- =====================================================

-- Check if patients table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'patients'
) as patients_table_exists;

-- List all tables in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- If patients table exists, show its structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients'
ORDER BY ordinal_position;

-- =====================================================
-- RESULTS INTERPRETATION:
-- =====================================================
-- If patients_table_exists = false:
--   The table was NOT created. You need to run COMPLETE_FIX_SQL.sql
--
-- If patients_table_exists = true:
--   The table exists! The issue might be:
--   1. Supabase cache needs refresh
--   2. Wrong Supabase project
--   3. Backend using wrong credentials
-- =====================================================
