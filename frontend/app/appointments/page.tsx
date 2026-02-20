'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/useLanguage';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '@/lib/api';
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
import { Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    doctorName: '',
    doctorSpecialty: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
    status: 'scheduled'
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
      loadAppointments();
    };

    checkUser();
  }, [router]);

  const loadAppointments = async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      router.push('/login');
      return;
    }

    try {
      const result = await getAppointments(accessToken);
      
      if (result.success) {
        setAppointments(result.data.appointments || []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
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
        result = await updateAppointment(accessToken, editingId, formData);
        
        if (result.success) {
          // Optimistic update - update local state immediately
          setAppointments(prev => 
            prev.map(apt => 
              apt.id === editingId 
                ? { ...apt, ...formData, doctor_name: formData.doctorName, doctor_specialty: formData.doctorSpecialty, appointment_date: formData.appointmentDate, appointment_time: formData.appointmentTime }
                : apt
            )
          );
          showToast(result.message, 'success');
          setAppointmentModalOpen(false);
          setEditingId(null);
          resetForm();
          // Reload to get fresh data from server
          loadAppointments();
        } else {
          toast.error(result.message);
        }
      } else {
        result = await createAppointment(accessToken, formData);
        
        if (result.success) {
          toast.success(result.message);
          setAppointmentModalOpen(false);
          setEditingId(null);
          resetForm();
          // Reload to get fresh data from server
          loadAppointments();
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      toast.error('Failed to save appointment');
    }
  };

  const handleEdit = (appointment: any) => {
    setFormData({
      doctorName: appointment.doctor_name,
      doctorSpecialty: appointment.doctor_specialty || '',
      appointmentDate: appointment.appointment_date,
      appointmentTime: appointment.appointment_time,
      reason: appointment.reason || '',
      notes: appointment.notes || '',
      status: appointment.status
    });
    setEditingId(appointment.id);
    setAppointmentModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    // Optimistic update - remove from UI immediately
    const previousAppointments = [...appointments];
    setAppointments(prev => prev.filter(apt => apt.id !== id));

    try {
      const result = await deleteAppointment(accessToken, id);
      
      if (result.success) {
        toast.success('Appointment deleted successfully');
      } else {
        // Revert on error
        setAppointments(previousAppointments);
        toast.error(result.message);
      }
    } catch (error) {
      // Revert on error
      setAppointments(previousAppointments);
      toast.error('Failed to delete appointment');
    }
  };

  const resetForm = () => {
    setFormData({
      doctorName: '',
      doctorSpecialty: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: '',
      notes: '',
      status: 'scheduled'
    });
  };

  const handleCancel = () => {
    setAppointmentModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      scheduled: 'default',
      completed: 'secondary',
      cancelled: 'destructive',
      rescheduled: 'outline',
    };
    return variants[status] || 'default';
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
            <h1 className="text-3xl font-bold tracking-tight">{t('myAppointments')}</h1>
            <p className="text-muted-foreground">
              {t('manageAppointments')}
            </p>
          </div>
          
          {/* Appointment Modal */}
          <Dialog open={appointmentModalOpen} onOpenChange={setAppointmentModalOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { resetForm(); setEditingId(null); }}
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {t('bookNewAppointment')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? t('editAppointment') : t('bookNewAppointment')}
                </DialogTitle>
                <DialogDescription>
                  {t('appointmentDetails')}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">{t('doctorName')} *</Label>
                    <Input
                      id="doctorName"
                      value={formData.doctorName}
                      onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                      placeholder="Dr. John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doctorSpecialty">{t('specialty')}</Label>
                    <Input
                      id="doctorSpecialty"
                      value={formData.doctorSpecialty}
                      onChange={(e) => setFormData({ ...formData, doctorSpecialty: e.target.value })}
                      placeholder="Cardiologist"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointmentDate">{t('date')} *</Label>
                    <Input
                      id="appointmentDate"
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appointmentTime">{t('time')} *</Label>
                    <Input
                      id="appointmentTime"
                      type="time"
                      value={formData.appointmentTime}
                      onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                      required
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
                          <SelectItem value="scheduled">{t('scheduled')}</SelectItem>
                          <SelectItem value="completed">{t('completed')}</SelectItem>
                          <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                          <SelectItem value="rescheduled">{t('rescheduled')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="reason">{t('reason')}</Label>
                    <Input
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Regular checkup"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="notes">{t('notes')}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Any additional information..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                    {t('cancel')}
                  </Button>
                  <Button type="submit" className="flex-1 bg-blue-900 hover:bg-blue-800">
                    {editingId ? t('save') : t('bookAppointment')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('appointments')}</CardTitle>
            <CardDescription>
              {appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {t('noAppointments')}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('doctor')}</TableHead>
                      <TableHead>{t('specialty')}</TableHead>
                      <TableHead>{t('dateTime')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('reason')}</TableHead>
                      <TableHead className="text-right">{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">
                          {appointment.doctor_name}
                        </TableCell>
                        <TableCell>{appointment.doctor_specialty || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {new Date(appointment.appointment_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {appointment.appointment_time}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadge(appointment.status)}>
                            {t(appointment.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {appointment.reason || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(appointment)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(appointment.id)}
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
