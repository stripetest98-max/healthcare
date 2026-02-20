const { supabase } = require('../config/supabase');

// Get all permissions
const getPermissions = async (req, res) => {
  try {
    const { roleId } = req.query;

    let query = supabase
      .from('permissions')
      .select(`
        *,
        roles (
          id,
          name,
          description
        )
      `)
      .order('created_at', { ascending: false });

    if (roleId) {
      query = query.eq('role_id', roleId);
    }

    const { data: permissions, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: { permissions: permissions || [] }
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions'
    });
  }
};

// Get permissions by role ID
const getPermissionsByRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const { data: permissions, error } = await supabase
      .from('permissions')
      .select('*')
      .eq('role_id', roleId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { permissions: permissions || [] }
    });
  } catch (error) {
    console.error('Get permissions by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch permissions'
    });
  }
};

// Create or update permissions (bulk operation)
const upsertPermissions = async (req, res) => {
  try {
    const { roleId, permissions } = req.body;

    if (!roleId || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Role ID and permissions array are required'
      });
    }

    // Verify role exists
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // First, delete all existing permissions for this role
    const { error: deleteError } = await supabase
      .from('permissions')
      .delete()
      .eq('role_id', roleId);

    if (deleteError) {
      console.error('Delete permissions error:', deleteError);
      throw deleteError;
    }

    // Then, insert new permissions
    const permissionsData = permissions.map(perm => ({
      role_id: roleId,
      section: perm.section,
      can_view: perm.canView || false,
      can_edit: perm.canEdit || false,
      can_delete: perm.canDelete || false,
      is_own: perm.isOwn || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { data: insertedPermissions, error: insertError } = await supabase
      .from('permissions')
      .insert(permissionsData)
      .select();

    if (insertError) {
      console.error('Insert permissions error:', insertError);
      throw insertError;
    }

    res.json({
      success: true,
      message: 'Permissions updated successfully',
      data: { permissions: insertedPermissions }
    });
  } catch (error) {
    console.error('Upsert permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permissions'
    });
  }
};

// Create single permission
const createPermission = async (req, res) => {
  try {
    const { roleId, section, canView, canEdit, canDelete, isOwn } = req.body;

    if (!roleId || !section) {
      return res.status(400).json({
        success: false,
        message: 'Role ID and section are required'
      });
    }

    const { data: permission, error } = await supabase
      .from('permissions')
      .insert([{
        role_id: roleId,
        section,
        can_view: canView || false,
        can_edit: canEdit || false,
        can_delete: canDelete || false,
        is_own: isOwn || false
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({
          success: false,
          message: 'Permission for this section already exists'
        });
      }
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: { permission }
    });
  } catch (error) {
    console.error('Create permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create permission'
    });
  }
};

// Update permission
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { section, canView, canEdit, canDelete, isOwn } = req.body;

    const updateData = { updated_at: new Date().toISOString() };
    if (section !== undefined) updateData.section = section;
    if (canView !== undefined) updateData.can_view = canView;
    if (canEdit !== undefined) updateData.can_edit = canEdit;
    if (canDelete !== undefined) updateData.can_delete = canDelete;
    if (isOwn !== undefined) updateData.is_own = isOwn;

    const { data: permission, error } = await supabase
      .from('permissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }

    res.json({
      success: true,
      message: 'Permission updated successfully',
      data: { permission }
    });
  } catch (error) {
    console.error('Update permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permission'
    });
  }
};

// Delete permission
const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('permissions')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    console.error('Delete permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete permission'
    });
  }
};

// Delete all permissions for a role
const deletePermissionsByRole = async (req, res) => {
  try {
    const { roleId } = req.params;

    const { error } = await supabase
      .from('permissions')
      .delete()
      .eq('role_id', roleId);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Permissions deleted successfully'
    });
  } catch (error) {
    console.error('Delete permissions by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete permissions'
    });
  }
};

module.exports = {
  getPermissions,
  getPermissionsByRole,
  upsertPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  deletePermissionsByRole
};
