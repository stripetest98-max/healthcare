'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getPatients, 
  deletePatient
} from '@/lib/api';

export default function PatientsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
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
      loadPatients();
    };

    checkUser();
  }, [router]);

  const loadPatients = async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    if (!accessToken) {
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      const result = await getPatients(accessToken);
      
      if (result.success) {
        setPatients(result.data.patients || []);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    const previousPatients = [...patients];
    setPatients(prev => prev.filter(patient => patient.id !== id));

    try {
      const result = await deletePatient(accessToken, id);
      
      if (result.success) {
        toast.success('Patient deleted successfully');
      } else {
        setPatients(previousPatients);
        toast.error(result.message);
      }
    } catch (error) {
      setPatients(previousPatients);
      toast.error('Failed to delete patient');
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading && patients.length === 0) {
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage patient records and information
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Patient List</CardTitle>
                <CardDescription>
                  {patients.length} {patients.length === 1 ? 'patient' : 'patients'} registered
                </CardDescription>
              </div>
              
              <Button 
                onClick={() => router.push('/patients/add')}
                className="bg-blue-900 hover:bg-blue-800 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Patient
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No patients found. Add your first patient to get started.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Age/Gender</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            {patient.first_name} {patient.last_name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {calculateAge(patient.date_of_birth)} yrs / {patient.gender || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {patient.blood_group ? (
                            <Badge variant="outline">{patient.blood_group}</Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{patient.phone || '-'}</div>
                            <div className="text-muted-foreground">{patient.email || '-'}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(patient.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => router.push(`/patients/add?id=${patient.id}`)}
                              title="Edit patient"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(patient.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete patient"
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
