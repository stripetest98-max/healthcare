# Troubleshooting: "Route not found" Error

## Quick Checklist

### 1. ✅ Is the backend server running?
Check if you see this in the backend terminal:
```
Server running on port 5000
✅ All routes registered successfully
   - /api/roles
```

If not, run:
```bash
cd backend
npm start
```

### 2. ✅ Are the database tables created?
Open Supabase SQL Editor and run:
```sql
SELECT * FROM roles;
```

If you get "relation 'roles' does not exist", you need to:
1. Open `CREATE_ROLES_PERMISSIONS_TABLES.sql`
2. Copy ALL the SQL
3. Paste into Supabase SQL Editor
4. Click "Run"

### 3. ✅ Is the frontend calling the correct URL?
Open browser DevTools (F12) → Network tab
Try to create a role and check:
- Request URL should be: `http://localhost:5000/api/roles`
- Method should be: `POST`
- Status should NOT be: `404`

### 4. ✅ Check backend logs
When you try to create a role, you should see in backend terminal:
```
📥 POST /api/roles called
📝 Create role request received
Request body: { name: '...', description: '...', isActive: true }
```

If you don't see these logs, the request isn't reaching the backend.

## Common Issues & Solutions

### Issue 1: "Route not found" (404 error)
**Symptoms**: 
- Frontend shows error toast
- Network tab shows 404 status
- Backend logs show nothing

**Solutions**:
1. Restart backend server:
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm start
   ```

2. Verify routes are registered - you should see:
   ```
   ✅ All routes registered successfully
      - /api/roles
   ```

### Issue 2: "Failed to fetch roles" (500 error)
**Symptoms**:
- Network tab shows 500 status
- Backend logs show database error

**Solutions**:
1. Run the SQL migration (see step 2 above)
2. Check Supabase connection in `backend/config/supabase.js`
3. Verify environment variables in `backend/.env`:
   ```
   SUPABASE_URL=your-project-url
   SUPABASE_KEY=your-anon-key
   ```

### Issue 3: CORS error
**Symptoms**:
- Console shows: "Access to fetch blocked by CORS policy"
- Network tab shows CORS error

**Solutions**:
1. Check `backend/server.js` has:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));
   ```

2. Restart backend server

### Issue 4: Empty response or no data
**Symptoms**:
- Request succeeds (200 status)
- But no roles appear in the table

**Solutions**:
1. Check if roles exist in database:
   ```sql
   SELECT * FROM roles;
   ```

2. If empty, the default roles weren't inserted. Re-run the SQL migration.

## Testing the Endpoint Manually

### Test 1: Health Check
Open browser and go to:
```
http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Test 2: Get Roles
Open browser and go to:
```
http://localhost:5000/api/roles
```

Expected response:
```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "...",
        "name": "Admin",
        "description": "Full system access with all permissions",
        "is_active": true,
        "created_at": "...",
        "updated_at": "..."
      },
      ...
    ]
  }
}
```

### Test 3: Create Role (using curl or Postman)
```bash
curl -X POST http://localhost:5000/api/roles \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Role","description":"Test","isActive":true}'
```

Expected response:
```json
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "role": { ... }
  }
}
```

## Still Not Working?

### Check Backend Logs
Look for these specific messages when you try to create a role:

1. Route hit:
   ```
   📥 POST /api/roles called
   ```

2. Controller called:
   ```
   📝 Create role request received
   Request body: { ... }
   ```

3. Success or error:
   ```
   ✅ Role created successfully: { ... }
   ```
   OR
   ```
   Supabase error: { ... }
   ```

### If you see NO logs at all:
- The request isn't reaching the backend
- Check if frontend is calling the correct URL
- Check if backend server is actually running on port 5000
- Try accessing http://localhost:5000/api/health in browser

### If you see "Supabase error":
- Database tables don't exist → Run SQL migration
- Wrong credentials → Check .env file
- Network issue → Check Supabase project status

## Need More Help?

1. Share the exact error message from:
   - Browser console (F12 → Console tab)
   - Network tab (F12 → Network tab → Click failed request → Response)
   - Backend terminal logs

2. Verify:
   - Backend server is running: ✅ / ❌
   - Database tables exist: ✅ / ❌
   - Can access http://localhost:5000/api/health: ✅ / ❌
   - Can access http://localhost:5000/api/roles: ✅ / ❌
