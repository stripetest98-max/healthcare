# Fix Patient Creation Error

## Error
```json
{"success": false, "message": "Failed to create patient"}
```

## Possible Causes

### 1. Row Level Security (RLS) Policy Issue (Most Likely)

The patients table has RLS policies that only allow certain roles to insert patients.

**Who can create patients:**
- Admin role
- Receptionist role

**Check your user's role:**
1. Go to Supabase → Table Editor
2. Open `profiles` table
3. Find your user's row
4. Check the `role_id` column
5. If it's NULL or not Admin/Receptionist, that's the problem!

**Solution:**
1. Go to Supabase → Table Editor → `roles` table
2. Copy the UUID of "Admin" role
3. Go to `profiles` table
4. Find your user
5. Set `role_id` to the Admin UUID
6. Try creating patient again

### 2. Missing Required Fields

Required fields:
- firstName (first_name)
- lastName (last_name)
- dateOfBirth (date_of_birth)

Make sure all three are filled in the form.

### 3. Database Connection Issue

Check if:
- Backend is running
- Supabase credentials are correct in `.env`
- Internet connection is working

---

## Quick Fix Options

### Option A: Assign Admin Role to Your User

**SQL to run in Supabase:**
```sql
-- First, get the Admin role ID
SELECT id, name FROM roles WHERE name = 'Admin';

-- Then update your profile (replace YOUR_USER_ID and ADMIN_ROLE_ID)
UPDATE profiles 
SET role_id = 'ADMIN_ROLE_ID_HERE'
WHERE id = 'YOUR_USER_ID_HERE';
```

### Option B: Temporarily Disable RLS for Testing (NOT RECOMMENDED FOR PRODUCTION)

**SQL to run in Supabase:**
```sql
-- Temporarily allow anyone to insert patients (TESTING ONLY!)
CREATE POLICY "temp_allow_all_insert" ON patients
  FOR INSERT WITH CHECK (true);
```

**Remember to remove this after testing:**
```sql
DROP POLICY "temp_allow_all_insert" ON patients;
```

### Option C: Add a More Permissive Policy

**SQL to run in Supabase:**
```sql
-- Allow authenticated users to create patients
CREATE POLICY "Authenticated users can insert patients" ON patients
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

---

## Debug Steps

### Step 1: Check Backend Logs

Look at your backend console for detailed error messages. You should see:
```
Create patient error: [error details]
Error details: [JSON error]
```

### Step 2: Check User Role

Run this in Supabase SQL Editor:
```sql
SELECT 
  p.id,
  p.full_name,
  r.name as role_name,
  p.role_id
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.id = auth.uid();
```

### Step 3: Check RLS Policies

Run this in Supabase SQL Editor:
```sql
SELECT * FROM pg_policies WHERE tablename = 'patients';
```

### Step 4: Test Direct Insert

Try inserting directly in Supabase SQL Editor:
```sql
INSERT INTO patients (
  first_name,
  last_name,
  date_of_birth
) VALUES (
  'Test',
  'Patient',
  '1990-01-01'
);
```

If this fails, it's definitely an RLS issue.

---

## Most Common Solution

**99% of the time, the issue is that your user doesn't have the Admin or Receptionist role.**

**Quick Fix:**
1. Open Supabase → Table Editor → `roles`
2. Find "Admin" role, copy its `id` (UUID)
3. Open `profiles` table
4. Find your user (match email or id)
5. Paste the Admin UUID into the `role_id` column
6. Save
7. Refresh your app
8. Try creating patient again

---

## Verification

After fixing, you should be able to:
- ✅ Create patients without errors
- ✅ See success message
- ✅ See patient in the list

---

## Still Not Working?

If you're still getting errors:

1. **Check backend console** - Look for the actual error message
2. **Check browser console** (F12) - Look for network errors
3. **Check Supabase logs** - Dashboard → Logs → API
4. **Verify table exists** - Table Editor → patients table should be there
5. **Check .env file** - Make sure Supabase URL and keys are correct

---

## Need More Help?

Share these details:
1. Backend console error message (full error)
2. Your user's role (from profiles table)
3. Browser console errors (if any)
4. Screenshot of the error
