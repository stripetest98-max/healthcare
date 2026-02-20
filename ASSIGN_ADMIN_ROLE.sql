-- =====================================================
-- ASSIGN ADMIN ROLE TO USER
-- This fixes the "Failed to create patient" error
-- =====================================================

-- Step 1: Check current user and their role
-- Run this to see your user info
SELECT 
  p.id as user_id,
  p.full_name,
  p.email,
  r.name as current_role,
  p.role_id
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
ORDER BY p.created_at DESC
LIMIT 10;

-- Step 2: Get Admin role ID
-- Copy the 'id' value from the result
SELECT id, name, description 
FROM roles 
WHERE name = 'Admin';

-- Step 3: Assign Admin role to your user
-- Replace 'YOUR_USER_ID_HERE' with your actual user ID from Step 1
-- Replace 'ADMIN_ROLE_ID_HERE' with the Admin role ID from Step 2

-- Example (replace with your actual IDs):
-- UPDATE profiles 
-- SET role_id = 'abc123-def456-ghi789'
-- WHERE id = 'user123-456-789';

-- Uncomment and update this line:
-- UPDATE profiles 
-- SET role_id = 'ADMIN_ROLE_ID_HERE'
-- WHERE id = 'YOUR_USER_ID_HERE';

-- Step 4: Verify the role was assigned
-- Run this to confirm
SELECT 
  p.id,
  p.full_name,
  r.name as role_name
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.id = 'YOUR_USER_ID_HERE';

-- =====================================================
-- ALTERNATIVE: Assign Admin to ALL users (for testing)
-- =====================================================

-- WARNING: This gives Admin role to EVERYONE
-- Only use for testing/development!

-- Uncomment to assign Admin to all users:
-- UPDATE profiles 
-- SET role_id = (SELECT id FROM roles WHERE name = 'Admin')
-- WHERE role_id IS NULL;

-- =====================================================
-- QUICK FIX: Get your current user ID
-- =====================================================

-- If you're logged in, this shows YOUR user ID:
SELECT auth.uid() as my_user_id;

-- Then use that ID in the UPDATE statement above

-- =====================================================
-- COMPLETE EXAMPLE
-- =====================================================

-- 1. Get your user ID (if logged in via Supabase Auth)
-- SELECT auth.uid();

-- 2. Get Admin role ID
-- SELECT id FROM roles WHERE name = 'Admin';

-- 3. Update your profile (replace the IDs)
-- UPDATE profiles 
-- SET role_id = (SELECT id FROM roles WHERE name = 'Admin')
-- WHERE id = auth.uid();

-- This last query assigns Admin role to the currently logged-in user
-- Run this if you're logged in to Supabase with your app account

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Check all users and their roles
SELECT 
  p.id,
  p.full_name,
  p.email,
  r.name as role,
  p.created_at
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
ORDER BY p.created_at DESC;

-- =====================================================
-- DONE!
-- =====================================================
-- After assigning the role:
-- 1. Refresh your app
-- 2. Try creating a patient again
-- 3. It should work now!
-- =====================================================
