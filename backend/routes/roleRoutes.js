const express = require('express');
const router = express.Router();
const {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
} = require('../controllers/roleController');

console.log('🔧 Role routes module loaded');

// Get all roles
router.get('/', (req, res, next) => {
  console.log('📥 GET /api/roles called');
  getRoles(req, res, next);
});

// Get single role
router.get('/:id', (req, res, next) => {
  console.log('📥 GET /api/roles/:id called');
  getRoleById(req, res, next);
});

// Create role
router.post('/', (req, res, next) => {
  console.log('📥 POST /api/roles called');
  createRole(req, res, next);
});

// Update role
router.put('/:id', (req, res, next) => {
  console.log('📥 PUT /api/roles/:id called');
  updateRole(req, res, next);
});

// Delete role
router.delete('/:id', (req, res, next) => {
  console.log('📥 DELETE /api/roles/:id called');
  deleteRole(req, res, next);
});

module.exports = router;
