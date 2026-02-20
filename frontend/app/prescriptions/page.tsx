'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { getPrescriptions, createPrescription, updatePrescription, deletePrescription } from '@/lib/api';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Pill, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function PrescriptionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    prescribedBy: '',
    prescribedDate: new Date().toISOString().split('T')[0],
    instructions: '',
    refills: 0,
    status: 'active'
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
      loadPrescriptions(1);
    };

    checkUser();
  }, [router]);

  const loadPrescriptions = async (page: number) => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const result = await getPrescriptions(accessToken, page, 10);
      
      if (result.success) {
        setPrescriptions(result.data.prescriptions || []);
        setPagination(result.data.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error('Error loading prescriptions:', error);
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
        result = await updatePrescription(accessToken, editingId, formData);
        
        if (result.success) {
          // Optimistic update - update local state immediately
          setPrescriptions(prev => 
            prev.map(pres => 
              pres.id === editingId 
                ? { 
                    ...pres, 
                    medication_name: formData.medicationName,
                    dosage: formData.dosage,
                    frequency: formData.frequency,
                    duration: formData.duration,
                    prescribed_by: formData.prescribedBy,
                    prescribed_date: formData.prescribedDate,
                    instructions: formData.instructions,
                    refills: formData.refills,
                    status: formData.status
                  }
                : pres
            )
          );
          toast.success(result.message);
          setPrescriptionModalOpen(false);
          setEditingId(null);
          resetForm();
          // Reload to get fresh data from server
          loadPrescriptions(pagination.page);
        } else {
          toast.error(result.message);
        }
      } else {
        result = await createPrescription(accessToken, formData);
        
        if (result.success) {
          toast.success(result.message);
          setPrescriptionModalOpen(false);
          setEditingId(null);
          resetForm();
          // Reload to get fresh data from server
          loadPrescriptions(pagination.page);
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error('Failed to save prescription');
    }
  };

  const handleEdit = (prescription: any) => {
    setFormData({
      medicationName: prescription.medication_name,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration || '',
      prescribedBy: prescription.prescribed_by || '',
      prescribedDate: prescription.prescribed_date,
      instructions: prescription.instructions || '',
      refills: prescription.refills || 0,
      status: prescription.status
    });
    setEditingId(prescription.id);
    setPrescriptionModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prescription?')) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    // Optimistic update - remove from UI immediately
    const previousPrescriptions = [...prescriptions];
    const previousPagination = { ...pagination };
    setPrescriptions(prev => prev.filter(pres => pres.id !== id));
    
    // Update pagination count
    setPagination(prev => ({
      ...prev,
      total: prev.total - 1
    }));

    try {
      const result = await deletePrescription(accessToken, id);
      
      if (result.success) {
        toast.success('Prescription deleted successfully');
        // Reload to get accurate pagination
        loadPrescriptions(pagination.page);
      } else {
        // Revert on error
        setPrescriptions(previousPrescriptions);
        setPagination(previousPagination);
        toast.error(result.message);
      }
    } catch (error) {
      // Revert on error
      setPrescriptions(previousPrescriptions);
      setPagination(previousPagination);
      toast.error('Failed to delete prescription');
    }
  };

  const resetForm = () => {
    setFormData({
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      prescribedBy: '',
      prescribedDate: new Date().toISOString().split('T')[0],
      instructions: '',
      refills: 0,
      status: 'active'
    });
  };

  const handleCancel = () => {
    setPrescriptionModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
    };
    return variants[status] || 'default';
  };

  if (loading && prescriptions.length === 0) {
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
            <h1 className="text-3xl font-bold tracking-tight">{t('myPrescriptions')}</h1>
            <p className="text-muted-foreground">
              {t('managePrescriptions')}
            </p>
          </div>
          
          {/* Prescription Modal */}
          <Dialog open={prescriptionModalOpen} onOpenChange={setPrescriptionModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingId(null); }}>
                <Pill className="mr-2 h-4 w-4" />
                {t('addPrescription')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? t('editPrescription') : t('addPrescription')}
                </DialogTitle>
                <DialogDescription>
                  {t('prescriptionDetails')}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicationName">{t('medicationName')} *</Label>
                    <Input
                      id="medicationName"
                      value={formData.medicationName}
                      onChange={(e) => setFormData({ ...formData, medicationName: e.target.value })}
                      placeholder="Aspirin"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dosage">{t('dosage')} *</Label>
                    <Input
                      id="dosage"
                      value={formData.dosage}
                      onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                      placeholder="100mg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">{t('frequency')} *</Label>
                    <Input
                      id="frequency"
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      placeholder="Twice daily"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">{t('duration')}</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="30 days"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prescribedBy">{t('prescribedBy')}</Label>
                    <Input
                      id="prescribedBy"
                      value={formData.prescribedBy}
                      onChange={(e) => setFormData({ ...formData, prescribedBy: e.target.value })}
                      placeholder="Dr. John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prescribedDate">{t('prescribedDate')}</Label>
                    <Input
                      id="prescribedDate"
                      type="date"
                      value={formData.prescribedDate}
                      onChange={(e) => setFormData({ ...formData, prescribedDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refills">{t('refills')}</Label>
                    <Input
                      id="refills"
                      type="number"
                      min="0"
                      value={formData.refills}
                      onChange={(e) => setFormData({ ...formData, refills: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  {editingId && (
                    <div className="space-y-2">
                      <Label htmlFor="status">{t('status')}</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">{t('active')}</SelectItem>
                          <SelectItem value="completed">{t('completed')}</SelectItem>
                          <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="instructions">{t('instructions')}</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      placeholder="Take with food..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingId ? t('save') : t('addPrescription')}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                    {t('cancel')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Prescriptions Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('prescriptions')}</CardTitle>
            <CardDescription>
              {pagination.total} {pagination.total === 1 ? 'prescription' : 'prescriptions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t('noPrescriptions')}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('medicationName')}</TableHead>
                        <TableHead>{t('dosage')}</TableHead>
                        <TableHead>{t('frequency')}</TableHead>
                        <TableHead>{t('duration')}</TableHead>
                        <TableHead>{t('prescribedBy')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead className="text-right">{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptions.map((prescription) => (
                        <TableRow key={prescription.id}>
                          <TableCell className="font-medium">
                            {prescription.medication_name}
                          </TableCell>
                          <TableCell>{prescription.dosage}</TableCell>
                          <TableCell>{prescription.frequency}</TableCell>
                          <TableCell>{prescription.duration || '-'}</TableCell>
                          <TableCell>{prescription.prescribed_by || '-'}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(prescription.status)}>
                              {t(prescription.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(prescription)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(prescription.id)}
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

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadPrescriptions(pagination.page - 1)}
                        disabled={pagination.page === 1 || loading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadPrescriptions(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages || loading}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
