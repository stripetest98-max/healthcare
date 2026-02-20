'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Lock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getRoles, getPermissionsByRole, upsertPermissions } from '@/lib/api';

interface Permission {
  section: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isOwn: boolean;
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

export default function PermissionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);

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
      
      if (result.success && result.data.roles.length > 0) {
        setRoles(result.data.roles || []);
        const firstRole = result.data.roles[0];
        setSelectedRoleId(firstRole.id);
        loadPermissions(firstRole.id);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async (roleId: string) => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) return;

    try {
      const result = await getPermissionsByRole(accessToken, roleId);
      
      if (result.success) {
        const perms = result.data.permissions.map((p: any) => ({
          section: p.section,
          canView: p.can_view,
          canEdit: p.can_edit,
          canDelete: p.can_delete,
          isOwn: p.is_own
        }));
        setPermissions(perms);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  const handleRoleChange = (roleId: string) => {
    setSelectedRoleId(roleId);
    loadPermissions(roleId);
  };

  const handlePermissionChange = (index: number, field: keyof Permission, value: boolean) => {
    setPermissions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddSection = () => {
    const usedSections = permissions.map(p => p.section);
    const availableToAdd = availableSections.filter(s => !usedSections.includes(s));
    
    if (availableToAdd.length === 0) {
      toast.error('All sections have been added');
      return;
    }

    setPermissions(prev => [...prev, {
      section: availableToAdd[0],
      canView: false,
      canEdit: false,
      canDelete: false,
      isOwn: false
    }]);
  };

  const handleRemoveSection = (index: number) => {
    setPermissions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken || !selectedRoleId) return;

    try {
      const result = await upsertPermissions(accessToken, selectedRoleId, permissions);
      
      if (result.success) {
        toast.success('Permissions saved successfully');
        setPermissionModalOpen(false);
        loadPermissions(selectedRoleId);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to save permissions');
    }
  };

  const handleSectionChange = (index: number, newSection: string) => {
    setPermissions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], section: newSection };
      return updated;
    });
  };

  const getAvailableSectionsForIndex = (currentIndex: number) => {
    const usedSections = permissions
      .map((p, i) => i !== currentIndex ? p.section : null)
      .filter(Boolean);
    return availableSections.filter(s => !usedSections.includes(s));
  };

  if (loading) {
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
            <p className="text-muted-foreground">
              Configure role-based access control
            </p>
          </div>
          
          {/* Permission Modal */}
          <Dialog open={permissionModalOpen} onOpenChange={setPermissionModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Lock className="mr-2 h-4 w-4" />
                Add Permissions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Permissions</DialogTitle>
                <DialogDescription>
                  Configure permissions for the selected role
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select value={selectedRoleId} onValueChange={handleRoleChange}>
                    <SelectTrigger>
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

                {/* Dashboard Access - Optional Feature */}
                <div className="space-y-2">
                  <Label>Dashboard Access</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="personalized" />
                      <label htmlFor="personalized" className="text-sm">Personalized</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="super" />
                      <label htmlFor="super" className="text-sm">Super</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="sales" />
                      <label htmlFor="sales" className="text-sm">Sales</label>
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                  <Label>Section</Label>
                  
                  {permissions.map((permission, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <Select 
                          value={permission.section} 
                          onValueChange={(value) => handleSectionChange(index, value)}
                        >
                          <SelectTrigger className="w-64">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableSectionsForIndex(index).map((section) => (
                              <SelectItem key={section} value={section}>
                                {section}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSection(index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`view-${index}`}
                            checked={permission.canView}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(index, 'canView', checked as boolean)
                            }
                          />
                          <label htmlFor={`view-${index}`} className="text-sm">View</label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`edit-${index}`}
                            checked={permission.canEdit}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(index, 'canEdit', checked as boolean)
                            }
                          />
                          <label htmlFor={`edit-${index}`} className="text-sm">Edit</label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`delete-${index}`}
                            checked={permission.canDelete}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(index, 'canDelete', checked as boolean)
                            }
                          />
                          <label htmlFor={`delete-${index}`} className="text-sm">Delete</label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`own-${index}`}
                            checked={permission.isOwn}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(index, 'isOwn', checked as boolean)
                            }
                          />
                          <label htmlFor={`own-${index}`} className="text-sm">Is Own</label>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddSection}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add More
                  </Button>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button onClick={handleSave} className="flex-1">
                    Save
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setPermissionModalOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Permissions Display */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Permissions</CardTitle>
                <CardDescription>
                  Viewing permissions for selected role
                </CardDescription>
              </div>
              <Select value={selectedRoleId} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-64">
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
          </CardHeader>
          <CardContent>
            {permissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No permissions configured for this role.
              </div>
            ) : (
              <div className="space-y-4">
                {permissions.map((permission, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{permission.section}</h3>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Checkbox checked={permission.canView} disabled />
                        <span className="text-muted-foreground">View</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={permission.canEdit} disabled />
                        <span className="text-muted-foreground">Edit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={permission.canDelete} disabled />
                        <span className="text-muted-foreground">Delete</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={permission.isOwn} disabled />
                        <span className="text-muted-foreground">Is Own</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
