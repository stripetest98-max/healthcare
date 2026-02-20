# How to Run Database Migrations

## Option 1: Copy-Paste SQL (Recommended)

This is the easiest and most reliable method.

### Steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy the SQL**
   - Open the file: `RUN_ALL_MIGRATIONS.sql`
   - Copy ALL the content (Ctrl+A, Ctrl+C)

4. **Paste and Run**
   - Paste into the SQL Editor
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for completion (should take 5-10 seconds)

5. **Verify Success**
   - Check for green success message
   - Go to "Table Editor" to see all tables created

### What Gets Created:

✅ **Tables:**
- profiles (user profiles)
- appointments
- prescriptions
- lab_reports
- roles (RBAC)
- permissions (RBAC)
- patients
- patient_vitals
- patient_diagnosis

✅ **Default Roles:**
- Admin
- Doctor
- Nurse
- Receptionist
- Patient

✅ **Default Permissions:**
- Admin: Full access to all sections
- Doctor: Access to patients, appointments, prescriptions
- Patient: View-only access to own records

✅ **Security:**
- Row Level Security (RLS) enabled on all tables
- Policies configured for role-based access
- Automatic profile creation on user signup

---

## Option 2: Run via Node Script (Alternative)

If you prefer to run migrations programmatically:

### Steps:

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Run migration script**
   ```bash
   node scripts/runMigrations.js
   ```

### Note:
This method may have issues with complex SQL statements and RLS policies. If it fails, use Option 1 instead.

---

## Troubleshooting

### Error: "column profiles.role does not exist"
✅ **Fixed!** The SQL files have been updated to use `role_id` with proper JOIN syntax.

### Error: "relation already exists"
This is normal if you've run migrations before. The SQL uses `IF NOT EXISTS` to prevent errors.

### Error: "permission denied"
Make sure you're using the Service Role Key in your `.env` file, not the Anon Key.

### Tables not showing up
1. Refresh the Supabase dashboard
2. Check the SQL Editor for error messages
3. Verify you're in the correct project

---

## Verification

After running migrations, verify everything is set up:

1. **Check Tables**
   - Go to Table Editor in Supabase
   - You should see 9 tables

2. **Check Roles**
   - Open the `roles` table
   - Should have 5 default roles

3. **Check Permissions**
   - Open the `permissions` table
   - Should have default permissions for Admin, Doctor, and Patient

4. **Test Application**
   - Start your backend: `cd backend && npm start`
   - Start your frontend: `cd frontend && npm run dev`
   - Try logging in and accessing different features

---

## Next Steps

After migrations are complete:

1. **Assign Roles to Users**
   - Go to Supabase Table Editor
   - Open `profiles` table
   - Set `role_id` for each user (use the UUID from `roles` table)

2. **Test RBAC**
   - Login with different user roles
   - Verify permissions work correctly
   - Check that users can only access what they're allowed to

3. **Customize Permissions**
   - Use the Roles & Permissions page in your app
   - Add/edit roles and permissions as needed

---

## Files Reference

- `RUN_ALL_MIGRATIONS.sql` - Complete migration SQL (use this!)
- `CREATE_PATIENTS_TABLES.sql` - Patient tables only
- `CREATE_ROLES_PERMISSIONS_TABLES.sql` - RBAC tables only
- `backend/database/migrations/*.sql` - Individual migration files
- `FIX_PROFILES_ROLE_COLUMN.md` - Details about the role column fix
