# URGENT: Create Patients Table in Supabase

## Problem
The `patients` table doesn't exist in your Supabase database yet.

## Quick Fix (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar

### Step 2: Run the SQL
1. Click "New Query" button
2. Copy the ENTIRE content from the file: `CREATE_PATIENTS_TABLES.sql`
3. Paste it into the SQL Editor
4. Click "Run" button (or press Ctrl+Enter)
5. Wait for "Success" message

### Step 3: Verify Tables Created
1. Click "Table Editor" in left sidebar
2. You should see these new tables:
   - ✅ patients
   - ✅ patient_vitals
   - ✅ patient_diagnosis

### Step 4: Test Your App
1. Refresh your frontend page
2. Try creating a patient again
3. Should work now!

## Alternative: Run All Migrations

If you want to set up EVERYTHING at once:

1. Open Supabase SQL Editor
2. Copy content from: `RUN_ALL_MIGRATIONS.sql`
3. Paste and Run
4. This creates ALL tables including:
   - profiles
   - appointments
   - prescriptions
   - lab_reports
   - roles
   - permissions
   - patients
   - patient_vitals
   - patient_diagnosis

## Why This Happened

The migrations need to be run in Supabase to create the database tables. The backend code expects these tables to exist, but they haven't been created yet.

## Verification

After running the SQL, check in Supabase Table Editor:
- Go to "Table Editor"
- Look for "patients" table
- If you see it, you're good to go!

## Still Having Issues?

If the error persists:
1. Make sure you ran the SQL in the correct Supabase project
2. Check if there are any error messages in the SQL Editor
3. Try refreshing the Supabase dashboard
4. Restart your backend server

---

**DO THIS NOW:** Copy `CREATE_PATIENTS_TABLES.sql` into Supabase SQL Editor and run it!
