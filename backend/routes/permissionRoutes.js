const express = require('express');
const router = express.Router();
const {
  getPermissions,
  getPermissionsByRole,
  upsertPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  deletePermissionsByRole
} = require('../controllers/permissionController');

// Get all permissions (with optional roleId query param)
router.get('/', getPermissions);

// Get permissions by role ID
router.get('/role/:roleId', getPermissionsByRole);

// Bulk upsert permissions
router.post('/bulk', upsertPermissions);

// Create single permission
router.post('/', createPermission);

// Update permission
router.put('/:id', updatePermission);

// Delete permission
router.delete('/:id', deletePermission);

// Delete all permissions for a role
router.delete('/role/:roleId', deletePermissionsByRole);

module.exports = router;
