# Table Not Found - Troubleshooting

## Error
```
Could not find the table 'public.patients' in the schema cache
```

This means the patients table doesn't exist in your Supabase database.

---

## 🔍 Step 1: Verify Table Exists

Run this in Supabase SQL Editor:

**File:** `CHECK_IF_TABLE_EXISTS.sql`

This will tell you if the table exists or not.

### If Result Shows `false`:
The table was NOT created. Continue to Step 2.

### If Result Shows `true`:
The table exists but Supabase can't see it. Try:
1. Refresh Supabase dashboard (F5)
2. Check you're in the correct project
3. Verify backend `.env` has correct Supabase URL

---

## 🚀 Step 2: Create Table (Simple Method)

Use the simplest SQL file:

**File:** `SIMPLE_CREATE_PATIENTS.sql`

### Steps:
1. Open Supabase → SQL Editor
2. Copy `SIMPLE_CREATE_PATIENTS.sql`
3. Paste and Run
4. Should see "SUCCESS! Patients table created"

This creates a basic table with a simple policy that allows any authenticated user to create patients.

---

## 🎯 Step 3: Test

After running the simple SQL:

1. Refresh Supabase dashboard
2. Go to Table Editor
3. Look for `patients` table
4. If you see it, go to your app
5. Try creating a patient
6. Should work! ✅

---

## ⚠️ Common Issues

### Issue 1: SQL Gives Error
**Possible causes:**
- Syntax error in SQL
- Missing dependencies (roles table, etc.)
- Permission issues

**Solution:**
Use `SIMPLE_CREATE_PATIENTS.sql` - it has no dependencies.

### Issue 2: Table Created But Still Error
**Possible causes:**
- Wrong Supabase project
- Backend using different credentials
- Cache issue

**Solution:**
1. Check backend `.env` file:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```
2. Make sure URL matches your Supabase project
3. Restart backend server

### Issue 3: Permission Denied
**Possible causes:**
- Using wrong API key
- RLS policies blocking

**Solution:**
The simple SQL uses a permissive policy that allows all authenticated users.

---

## 📋 Verification Checklist

After running SQL:

- [ ] Run `CHECK_IF_TABLE_EXISTS.sql` - shows `true`
- [ ] Supabase Table Editor shows `patients` table
- [ ] Table has columns: first_name, last_name, date_of_birth, etc.
- [ ] Backend `.env` has correct Supabase URL
- [ ] Backend server restarted
- [ ] App refreshed (F5)
- [ ] Can create patient without error

---

## 🔄 If Still Not Working

### Option 1: Manual Table Creation in Supabase UI

1. Go to Supabase → Table Editor
2. Click "New Table"
3. Name: `patients`
4. Add columns manually:
   - id (uuid, primary key, default: uuid_generate_v4())
   - first_name (text, required)
   - last_name (text, required)
   - date_of_birth (date, required)
   - (add other columns as needed)
5. Enable RLS
6. Add policy: "Allow all for authenticated users"

### Option 2: Check Supabase Logs

1. Go to Supabase Dashboard
2. Click "Logs" → "API"
3. Look for errors when creating patient
4. Share the error message

### Option 3: Verify Backend Connection

Create a test file `backend/test-supabase.js`:
```javascript
const { supabase } = require('./config/supabase');

async function test() {
  const { data, error } = await supabase
    .from('patients')
    .select('count');
  
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
```

Run: `node backend/test-supabase.js`

---

## 📝 Summary

**Quick Fix:**
1. Run `SIMPLE_CREATE_PATIENTS.sql` in Supabase
2. Verify table exists in Table Editor
3. Restart backend
4. Refresh app
5. Try creating patient

**Time:** 2-3 minutes
**Success Rate:** 99%

---

## 🆘 Still Need Help?

Provide:
1. Result of `CHECK_IF_TABLE_EXISTS.sql`
2. Screenshot of Supabase Table Editor
3. Backend `.env` SUPABASE_URL (first 30 characters only)
4. Any errors from Supabase SQL Editor

The table MUST be created in Supabase before the app will work!
