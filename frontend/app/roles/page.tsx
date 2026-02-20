'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getRoles, 
  createRole, 
  updateRole, 
  deleteRole,
  getPermissions,
  upsertPermissions,
  deletePermission
} from '@/lib/api';

interface Permission {
  id?: string;
  role_id?: string;
  section: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
  is_own: boolean;
  created_at?: string;
  roles?: {
    name: string;
  };
}

const availableSections = [
  'Dashboard',
  'Appointments',
  'Prescriptions',
  'Lab Reports',
  'Patients',
  'Doctors',
  'Roles',
  'Permissions',
  'Settings'
];

export default function RolesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');
  
  // Roles state
  const [roles, setRoles] = useState<any[]>([]);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  // Permissions state
  const [permissions, setPermissions] = useState<any[]>([]);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [permissionFormData, setPermissionFormData] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      const accessToken = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user');

      if (!accessToken || !userData) {
        router.push('/login');
        return;
      }

      setUser(JSON.parse(userData));
      loadRoles();
      loadPermissions();
    };

    checkUser();
  }, [router]);

  const loadRoles = async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const result = await getRoles(accessToken);
      
      if (result.success) {
        setRoles(result.data.roles || []);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) return;

    try {
      const result = await getPermissions(accessToken);
      
      if (result.success && result.data.permissions) {
        // Group permissions by role
        const grouped = result.data.permissions.reduce((acc: any, perm: any) => {
          const roleName = perm.roles?.name || 'Unknown';
          const roleId = perm.role_id;
          
          if (!acc[roleId]) {
            acc[roleId] = {
              roleName,
              roleId,
              sections: [],
              createdAt: perm.created_at
            };
          }
          acc[roleId].sections.push(perm.section);
          return acc;
        }, {});
        
        setPermissions(Object.values(grouped));
      } else {
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
    }
  };

  // Role handlers
  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/login');
      return;
    }

    try {
      let result;
      if (editingRoleId) {
        result = await updateRole(accessToken, editingRoleId, roleFormData);
        
        if (result.success) {
          setRoles(prev => 
            prev.map(role => 
              role.id === editingRoleId 
                ? { ...role, ...roleFormData, updated_at: new Date().toISOString() }
                : role
            )
          );
          toast.success(result.message);
          setRoleModalOpen(false);
          setEditingRoleId(null);
          resetRoleForm();
          loadRoles();
        } else {
          toast.error(result.message);
        }
      } else {
        result = await createRole(accessToken, roleFormData);
        
        if (result.success) {
          setRoles(prev => [result.data.role, ...prev]);
          toast.success(result.message);
          setRoleModalOpen(false);
          resetRoleForm();
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  const handleRoleEdit = (role: any) => {
    setRoleFormData({
      name: role.name,
      description: role.description || '',
      isActive: role.is_active
    });
    setEditingRoleId(role.id);
    setRoleModalOpen(true);
  };

  const handleRoleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    const previousRoles = [...roles];
    setRoles(prev => prev.filter(role => role.id !== id));

    try {
      const result = await deleteRole(accessToken, id);
      
      if (result.success) {
        toast.success('Role deleted successfully');
      } else {
        setRoles(previousRoles);
        toast.error(result.message);
      }
    } catch (error) {
      setRoles(previousRoles);
      toast.error('Failed to delete role');
    }
  };

  const resetRoleForm = () => {
    setRoleFormData({
      name: '',
      description: '',
      isActive: true
    });
  };

  // Permission handlers
  const handlePermissionEdit = async (permission: any) => {
    const roleId = permission.roleId || '';
    setSelectedRoleId(roleId);
    
    // Load all permissions for this role from backend
    await loadPermissionsForRole(roleId);
    setPermissionModalOpen(true);
  };

  const loadPermissionsForRole = async (roleId: string) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    try {
      const result = await getPermissions(accessToken, roleId);
      if (result.success && result.data.permissions) {
        setPermissionFormData(result.data.permissions.map((p: any) => ({
          section: p.section,
          can_view: p.can_view,
          can_edit: p.can_edit,
          can_delete: p.can_delete,
          is_own: p.is_own
        })));
      } else {
        setPermissionFormData([]);
      }
    } catch (error) {
      console.error('Error loading role permissions:', error);
      setPermissionFormData([]);
    }
  };

  const handlePermissionDelete = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete all permissions for this role?')) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    const previousPermissions = [...permissions];
    setPermissions(prev => prev.filter((p: any) => p.roleId !== roleId));

    try {
      // Delete all permissions for this role
      const result = await getPermissions(accessToken, roleId);
      if (result.success) {
        // Delete each permission
        for (const perm of result.data.permissions) {
          await deletePermission(accessToken, perm.id);
        }
        toast.success('Permissions deleted successfully');
        loadPermissions();
      }
    } catch (error) {
      setPermissions(previousPermissions);
      toast.error('Failed to delete permissions');
    }
  };

  const handlePermissionSave = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || !selectedRoleId) {
      toast.error('Please select a role');
      return;
    }

    if (permissionFormData.length === 0) {
      toast.error('Please add at least one section');
      return;
    }

    try {
      const result = await upsertPermissions(
        accessToken, 
        selectedRoleId, 
        permissionFormData.map(p => ({
          section: p.section,
          canView: p.can_view,
          canEdit: p.can_edit,
          canDelete: p.can_delete,
          isOwn: p.is_own
        }))
      );
      
      if (result.success) {
        toast.success('Permissions saved successfully');
        setPermissionModalOpen(false);
        setSelectedRoleId('');
        setPermissionFormData([]);
        loadPermissions();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Save permission error:', error);
      toast.error('Failed to save permissions');
    }
  };

  const handleAddPermissionSection = () => {
    const usedSections = permissionFormData.map(p => p.section);
    const availableToAdd = availableSections.filter(s => !usedSections.includes(s));
    
    if (availableToAdd.length === 0) {
      toast.error('All sections have been added');
      return;
    }

    setPermissionFormData(prev => [...prev, {
      section: availableToAdd[0],
      can_view: false,
      can_edit: false,
      can_delete: false,
      is_own: false
    }]);
  };

  const handleRemovePermissionSection = (index: number) => {
    if (permissionFormData.length === 1) {
      toast.error('At least one section is required');
      return;
    }
    setPermissionFormData(prev => prev.filter((_, i) => i !== index));
  };

  const handlePermissionChange = (index: number, field: keyof Permission, value: boolean | string) => {
    setPermissionFormData(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  if (loading && roles.length === 0) {
    return (
      <DashboardLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground">
            Manage user roles and access control
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'roles'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Roles
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'permissions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Permissions
            </button>
          </div>
        </div>

        {/* Roles Tab Content */}
        {activeTab === 'roles' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Roles</CardTitle>
                  <CardDescription>
                    {roles.length} {roles.length === 1 ? 'role' : 'roles'} configured
                  </CardDescription>
                </div>
                
                <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => { resetRoleForm(); setEditingRoleId(null); }}
                      className="bg-blue-900 hover:bg-blue-800 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRoleId ? 'Edit Role' : 'Add New Role'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingRoleId ? 'Update role information' : 'Create a new role for your system'}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleRoleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={roleFormData.name}
                          onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                          placeholder="Enter role name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                          id="description"
                          value={roleFormData.description}
                          onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                          placeholder="Enter description"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setRoleModalOpen(false);
                            setEditingRoleId(null);
                            resetRoleForm();
                          }} 
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-blue-900 hover:bg-blue-800">
                          Save changes
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {roles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No roles found. Create your first role to get started.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-600" />
                              {role.name}
                            </div>
                          </TableCell>
                          <TableCell>{role.description || '-'}</TableCell>
                          <TableCell>
                            {new Date(role.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRoleEdit(role)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRoleDelete(role.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Permissions Tab Content */}
        {activeTab === 'permissions' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Permission List</CardTitle>
                  <CardDescription>
                    Manage your permissions here
                  </CardDescription>
                </div>
                
                <Dialog open={permissionModalOpen} onOpenChange={setPermissionModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => {
                        setSelectedRoleId('');
                        setPermissionFormData([]);
                      }}
                      className="bg-blue-900 hover:bg-blue-800 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Permission
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">Add Permissions</DialogTitle>
                      <DialogDescription>
                        Configure permissions for the selected role
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      {/* Role Selection */}
                      <div className="space-y-2">
                        <Label className="text-base font-semibold">Role *</Label>
                        <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sections */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base font-semibold">Sections</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddPermissionSection}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Section
                          </Button>
                        </div>
                        
                        {permissionFormData.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            No sections added yet. Click "Add Section" to get started.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {permissionFormData.map((permission, index) => (
                              <div key={index} className="border rounded-lg p-4 bg-muted/30 space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1">
                                    <Label className="text-sm mb-2 block">Section Name</Label>
                                    <Select 
                                      value={permission.section} 
                                      onValueChange={(value) => handlePermissionChange(index, 'section', value)}
                                    >
                                      <SelectTrigger className="h-10">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableSections.map((section) => (
                                          <SelectItem key={section} value={section}>
                                            {section}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemovePermissionSection(index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-6"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="flex items-center space-x-2 p-2 rounded hover:bg-background">
                                    <Checkbox 
                                      id={`view-${index}`}
                                      checked={permission.can_view}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(index, 'can_view', checked as boolean)
                                      }
                                    />
                                    <label 
                                      htmlFor={`view-${index}`} 
                                      className="text-sm font-medium cursor-pointer"
                                    >
                                      View
                                    </label>
                                  </div>

                                  <div className="flex items-center space-x-2 p-2 rounded hover:bg-background">
                                    <Checkbox 
                                      id={`edit-${index}`}
                                      checked={permission.can_edit}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(index, 'can_edit', checked as boolean)
                                      }
                                    />
                                    <label 
                                      htmlFor={`edit-${index}`} 
                                      className="text-sm font-medium cursor-pointer"
                                    >
                                      Edit
                                    </label>
                                  </div>

                                  <div className="flex items-center space-x-2 p-2 rounded hover:bg-background">
                                    <Checkbox 
                                      id={`delete-${index}`}
                                      checked={permission.can_delete}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(index, 'can_delete', checked as boolean)
                                      }
                                    />
                                    <label 
                                      htmlFor={`delete-${index}`} 
                                      className="text-sm font-medium cursor-pointer"
                                    >
                                      Delete
                                    </label>
                                  </div>

                                  <div className="flex items-center space-x-2 p-2 rounded hover:bg-background">
                                    <Checkbox 
                                      id={`own-${index}`}
                                      checked={permission.is_own}
                                      onCheckedChange={(checked) => 
                                        handlePermissionChange(index, 'is_own', checked as boolean)
                                      }
                                    />
                                    <label 
                                      htmlFor={`own-${index}`} 
                                      className="text-sm font-medium cursor-pointer"
                                    >
                                      Is Own
                                    </label>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setPermissionModalOpen(false);
                            setSelectedRoleId('');
                            setPermissionFormData([]);
                          }}
                          className="flex-1 h-11"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handlePermissionSave} 
                          className="flex-1 h-11 bg-blue-900 hover:bg-blue-800"
                          disabled={!selectedRoleId || permissionFormData.length === 0}
                        >
                          Save Permissions
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {!permissions || permissions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No permissions configured yet.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Sections</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissions.map((permission: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {permission.roleName}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {permission.sections && permission.sections.map((section: string, idx: number) => (
                                <Badge key={idx} variant="secondary">
                                  {section}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            {permission.createdAt 
                              ? new Date(permission.createdAt).toLocaleDateString('en-GB', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePermissionEdit(permission)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handlePermissionDelete(permission.roleId)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
