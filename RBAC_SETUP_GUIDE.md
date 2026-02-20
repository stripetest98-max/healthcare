# Role-Based Access Control (RBAC) Setup Guide

## Overview
This healthcare application now includes a comprehensive Role-Based Access Control (RBAC) system that allows you to manage user roles and permissions.

## Features

### 1. Roles Management
- Create, read, update, and delete roles
- Each role has:
  - **Name**: Unique identifier for the role
  - **Description**: Optional description of the role's purpose
  - **Status**: Active/Inactive flag
- Default roles included:
  - Admin (Full system access)
  - Doctor (Medical staff access)
  - Nurse (Limited patient access)
  - Receptionist (Appointment management)
  - Patient (Personal health records)

### 2. Permissions Management
- Configure granular permissions for each role
- Permission types per section:
  - **View**: Can view/read data
  - **Edit**: Can modify data
  - **Delete**: Can delete data
  - **Is Own**: Can only access their own data
- Available sections:
  - Dashboard
  - Appointments
  - Prescriptions
  - Lab Reports
  - Patients
  - Doctors
  - Roles
  - Permissions
  - Settings

## Database Setup

### Step 1: Run SQL Migration
Copy and paste the contents of `CREATE_ROLES_PERMISSIONS_TABLES.sql` into your Supabase SQL Editor:

```sql
-- This will create:
-- 1. roles table
-- 2. permissions table
-- 3. Add role_id column to profiles table
-- 4. Insert default roles and permissions
```

### Step 2: Verify Tables
After running the migration, verify that the following tables exist:
- `roles`
- `permissions`
- `profiles` (with role_id column)

## Backend API Endpoints

### Roles API (`/api/roles`)
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get single role
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Permissions API (`/api/permissions`)
- `GET /api/permissions` - Get all permissions (optional roleId query param)
- `GET /api/permissions/role/:roleId` - Get permissions by role
- `POST /api/permissions/bulk` - Bulk upsert permissions
- `POST /api/permissions` - Create single permission
- `PUT /api/permissions/:id` - Update permission
- `DELETE /api/permissions/:id` - Delete permission
- `DELETE /api/permissions/role/:roleId` - Delete all permissions for a role

## Frontend Pages

### Roles Page (`/roles`)
- View all roles in a table
- Add new roles with name and description
- Edit existing roles
- Delete roles (with validation to prevent deletion if assigned to users)
- Real-time updates with optimistic UI

### Permissions Page (`/permissions`)
- Select a role to view/edit permissions
- Add multiple sections with granular permissions
- Configure View, Edit, Delete, and Is Own permissions
- Visual permission display for easy understanding
- Bulk save permissions

## Usage Examples

### Example 1: Create a New Role
1. Navigate to `/roles`
2. Click "Add New Role"
3. Enter role name (e.g., "Lab Technician")
4. Add description (optional)
5. Click "Save changes"

### Example 2: Configure Permissions
1. Navigate to `/permissions`
2. Click "Add Permissions"
3. Select a role from dropdown
4. Add sections using "Add More" button
5. For each section, check appropriate permissions:
   - ✓ View - User can see the data
   - ✓ Edit - User can modify the data
   - ✓ Delete - User can remove the data
   - ✓ Is Own - User can only access their own data
6. Click "Save"

### Example 3: Assign Role to User
Currently, roles are stored in the database. To assign a role to a user:
1. Update the `profiles` table
2. Set the `role_id` column to the desired role's UUID

```sql
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE name = 'Doctor')
WHERE user_id = 'user-uuid-here';
```

## Permission Logic

### Is Own Flag
When `is_own` is true, the user can only access data that belongs to them:
- **Appointments**: Only their own appointments
- **Prescriptions**: Only their own prescriptions
- **Lab Reports**: Only their own reports

### Permission Hierarchy
- **View**: Basic read access
- **Edit**: Requires View permission
- **Delete**: Requires View permission
- **Is Own**: Restricts access to user's own data only

## Security Considerations

1. **Role Deletion**: System prevents deletion of roles that are assigned to users
2. **Default Roles**: Admin role has full permissions by default
3. **Permission Validation**: Backend validates all permission changes
4. **Unique Constraints**: Role names must be unique
5. **Cascade Delete**: Deleting a role removes all associated permissions

## File Structure

### Backend
```
backend/
├── controllers/
│   ├── roleController.js
│   └── permissionController.js
├── routes/
│   ├── roleRoutes.js
│   └── permissionRoutes.js
└── database/
    └── migrations/
        ├── 005_create_roles_table.sql
        └── 006_create_permissions_table.sql
```

### Frontend
```
frontend/
├── app/
│   ├── roles/
│   │   └── page.tsx
│   └── permissions/
│       └── page.tsx
├── components/
│   └── ui/
│       └── checkbox.tsx
└── lib/
    └── api.ts (with role & permission functions)
```

## API Request Examples

### Create Role
```javascript
const response = await fetch('http://localhost:5000/api/roles', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    name: 'Lab Technician',
    description: 'Laboratory staff with test management access',
    isActive: true
  })
});
```

### Bulk Update Permissions
```javascript
const response = await fetch('http://localhost:5000/api/permissions/bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    roleId: 'role-uuid-here',
    permissions: [
      {
        section: 'Appointments',
        canView: true,
        canEdit: true,
        canDelete: false,
        isOwn: true
      },
      {
        section: 'Lab Reports',
        canView: true,
        canEdit: true,
        canDelete: true,
        isOwn: false
      }
    ]
  })
});
```

## Troubleshooting

### Issue: Cannot delete role
**Solution**: Check if the role is assigned to any users. Unassign the role first before deletion.

### Issue: Permissions not saving
**Solution**: Ensure the role exists and you have proper authentication token.

### Issue: Tables not found
**Solution**: Run the SQL migration file in Supabase SQL Editor.

## Next Steps

1. **Implement Middleware**: Add permission checking middleware to protect routes
2. **User Assignment**: Create UI to assign roles to users
3. **Audit Logging**: Track permission changes for security
4. **Role Templates**: Create predefined role templates
5. **Permission Groups**: Group related permissions together

## Support

For issues or questions:
1. Check the console for error messages
2. Verify database tables exist
3. Ensure backend server is running
4. Check API endpoints are accessible

---

**Version**: 1.0.0  
**Last Updated**: 2026-02-19
