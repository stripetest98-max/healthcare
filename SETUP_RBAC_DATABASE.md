# RBAC Database Setup - IMPORTANT!

## ⚠️ You MUST run this SQL first!

Before using the Roles and Permissions pages, you need to create the database tables.

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Copy and Paste SQL
Copy the ENTIRE contents of `CREATE_ROLES_PERMISSIONS_TABLES.sql` and paste it into the SQL editor.

### Step 3: Run the Query
Click the "Run" button (or press Ctrl+Enter / Cmd+Enter)

### Step 4: Verify Tables Created
You should see a success message. Verify by going to "Table Editor" and checking that these tables exist:
- ✅ roles
- ✅ permissions

### Step 5: Check Default Data
The SQL will also insert 5 default roles:
- Admin
- Doctor
- Nurse
- Receptionist
- Patient

### Troubleshooting

#### Error: "relation 'roles' does not exist"
**Solution**: You haven't run the SQL migration yet. Follow steps 1-3 above.

#### Error: "Route not found" when creating role
**Possible causes**:
1. Backend server not running - Run `npm start` in backend folder
2. Database tables not created - Follow steps above
3. Wrong API URL - Check that backend is running on port 5000

#### How to verify backend is working:
Open browser and go to: http://localhost:5000/api/health

You should see:
```json
{
  "success": true,
  "message": "Server is running"
}
```

#### How to test roles endpoint:
Open browser and go to: http://localhost:5000/api/roles

You should see:
```json
{
  "success": true,
  "data": {
    "roles": [...]
  }
}
```

If you see "Route not found", the backend server needs to be restarted.

### Quick Test Commands

#### Test backend health:
```bash
curl http://localhost:5000/api/health
```

#### Test roles endpoint:
```bash
curl http://localhost:5000/api/roles
```

Both should return JSON responses, not "Route not found".
