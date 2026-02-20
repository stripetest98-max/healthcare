# Supabase Connection Issue Fix

## Error
```
Error: getaddrinfo ENOTFOUND kzovgqhkityqvpqfvuiw.supabase.co
```

This means the backend cannot connect to Supabase.

## Quick Checks

### 1. Check Internet Connection
Open browser and visit:
```
https://kzovgqhkityqvpqfvuiw.supabase.co
```

If it loads, internet is fine. If not, check your connection.

### 2. Check Supabase Project Status
1. Go to https://supabase.com/dashboard
2. Login to your account
3. Check if project `kzovgqhkityqvpqfvuiw` is:
   - ✅ Active (green)
   - ⏸️ Paused (yellow) - Resume it
   - ❌ Deleted (red) - Create new project

### 3. Verify Supabase URL
In Supabase Dashboard:
1. Go to Project Settings → API
2. Copy the "Project URL"
3. Compare with `backend/.env` file
4. If different, update `.env` file

### 4. Test Connection
Run this command in backend folder:
```bash
node -e "fetch('https://kzovgqhkityqvpqfvuiw.supabase.co').then(r => console.log('Connected!', r.status)).catch(e => console.log('Error:', e.message))"
```

## Solutions

### Solution 1: Resume Paused Project
If project is paused:
1. Go to Supabase Dashboard
2. Click on your project
3. Click "Resume Project" button
4. Wait 2-3 minutes for it to start
5. Try login again

### Solution 2: Update Supabase URL
If URL changed:
1. Get new URL from Supabase Dashboard
2. Update `backend/.env`:
   ```
   SUPABASE_URL=https://your-new-url.supabase.co
   ```
3. Restart backend server

### Solution 3: Check Firewall/VPN
Sometimes firewall or VPN blocks Supabase:
1. Temporarily disable VPN
2. Check Windows Firewall settings
3. Try from different network

### Solution 4: Use Different DNS
If DNS issue:
1. Change DNS to Google DNS (8.8.8.8)
2. Or Cloudflare DNS (1.1.1.1)
3. Restart computer
4. Try again

## Temporary Workaround

If backend connection keeps failing, you can use frontend-only authentication:

1. Update frontend to use Supabase directly
2. Skip backend for auth operations
3. Use backend only for business logic

Let me know which solution worked!
