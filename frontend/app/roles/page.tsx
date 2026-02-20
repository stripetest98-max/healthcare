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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { getRoles, createRole, updateRole, deleteRole } from '@/lib/api';

export default function RolesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/login');
      return;
    }

    try {
      let result;
      if (editingId) {
        result = await updateRole(accessToken, editingId, formData);
        
        if (result.success) {
          setRoles(prev => 
            prev.map(role => 
              role.id === editingId 
                ? { ...role, ...formData, updated_at: new Date().toISOString() }
                : role
            )
          );
          toast.success(result.message);
          setRoleModalOpen(false);
          setEditingId(null);
          resetForm();
          loadRoles();
        } else {
          toast.error(result.message);
        }
      } else {
        result = await createRole(accessToken, formData);
        
        if (result.success) {
          // Add new role to the top of the list (descending order)
          setRoles(prev => [result.data.role, ...prev]);
          toast.success(result.message);
          setRoleModalOpen(false);
          resetForm();
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error('Failed to save role');
    }
  };

  const handleEdit = (role: any) => {
    setFormData({
      name: role.name,
      description: role.description || '',
      isActive: role.is_active
    });
    setEditingId(role.id);
    setRoleModalOpen(true);
  };

  const handleDelete = async (id: string) => {
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isActive: true
    });
  };

  const handleCancel = () => {
    setRoleModalOpen(false);
    setEditingId(null);
    resetForm();
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
            <p className="text-muted-foreground">
              Manage user roles and access control
            </p>
          </div>
          
          {/* Role Modal */}
          <Dialog open={roleModalOpen} onOpenChange={setRoleModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingId(null); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Role' : 'Add New Role'}
                </DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update role information' : 'Create a new role for your system'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter role name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    Save changes
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>
              {roles.length} {roles.length === 1 ? 'role' : 'roles'} configured
            </CardDescription>
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
                      <TableHead>Status</TableHead>
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
                          <Badge variant={role.is_active ? 'default' : 'secondary'}>
                            {role.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(role.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(role)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(role.id)}
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
      </div>
    </DashboardLayout>
  );
}
