const API_URL = 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// Register
export const registerUser = async (email: string, password: string, fullName: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, fullName }),
  });

  return response.json();
};

// Login
export const loginUser = async (email: string, password: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
};

// Forgot Password
export const forgotPassword = async (email: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  return response.json();
};

// Reset Password
export const resetPassword = async (password: string, accessToken: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password, accessToken }),
  });

  return response.json();
};

// Logout
export const logoutUser = async (accessToken: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken }),
  });

  return response.json();
};

// Get User Profile
export const getUserProfile = async (accessToken: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken }),
  });

  return response.json();
};

// Get Profile (from profiles table)
export const getProfile = async (accessToken: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/profile/get`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken }),
  });

  return response.json();
};

// Update Profile
export const updateProfile = async (accessToken: string, profileData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/profile/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken, ...profileData }),
  });

  return response.json();
};

// Delete Profile
export const deleteProfile = async (accessToken: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/profile/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken }),
  });

  return response.json();
};

// Create Appointment
export const createAppointment = async (accessToken: string, appointmentData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/appointments/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken, ...appointmentData }),
  });

  return response.json();
};

// Get Appointments
export const getAppointments = async (accessToken: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/appointments/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken }),
  });

  return response.json();
};

// Update Appointment
export const updateAppointment = async (accessToken: string, appointmentId: string, appointmentData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/appointments/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken, appointmentId, ...appointmentData }),
  });

  return response.json();
};

// Delete Appointment
export const deleteAppointment = async (accessToken: string, appointmentId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/appointments/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken, appointmentId }),
  });

  return response.json();
};

// Create Prescription
export const createPrescription = async (accessToken: string, prescriptionData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/prescriptions/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken, ...prescriptionData }),
  });

  return response.json();
};

// Get Prescriptions
export const getPrescriptions = async (accessToken: string, page = 1, limit = 10, status?: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/prescriptions/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken, page, limit, status }),
  });

  return response.json();
};

// Update Prescription
export const updatePrescription = async (accessToken: string, prescriptionId: string, prescriptionData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/prescriptions/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken, prescriptionId, ...prescriptionData }),
  });

  return response.json();
};

// Delete Prescription
export const deletePrescription = async (accessToken: string, prescriptionId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/prescriptions/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ accessToken, prescriptionId }),
  });

  return response.json();
};


// Contact Form
export const submitContactForm = async (name: string, email: string, message: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/contact/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, message }),
  });

  return response.json();
};

// ============ ROLES API ============

// Get all roles
export const getRoles = async (accessToken: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/roles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// Get single role
export const getRoleById = async (accessToken: string, roleId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/roles/${roleId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// Create role
export const createRole = async (accessToken: string, roleData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(roleData),
  });

  return response.json();
};

// Update role
export const updateRole = async (accessToken: string, roleId: string, roleData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/roles/${roleId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(roleData),
  });

  return response.json();
};

// Delete role
export const deleteRole = async (accessToken: string, roleId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/roles/${roleId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// ============ PERMISSIONS API ============

// Get all permissions (with optional roleId query)
export const getPermissions = async (accessToken: string, roleId?: string): Promise<ApiResponse> => {
  const url = roleId ? `${API_URL}/permissions?roleId=${roleId}` : `${API_URL}/permissions`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// Get permissions by role ID
export const getPermissionsByRole = async (accessToken: string, roleId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/permissions/role/${roleId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// Bulk upsert permissions
export const upsertPermissions = async (accessToken: string, roleId: string, permissions: any[]): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/permissions/bulk`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ roleId, permissions }),
  });

  return response.json();
};

// Create single permission
export const createPermission = async (accessToken: string, permissionData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/permissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(permissionData),
  });

  return response.json();
};

// Update permission
export const updatePermission = async (accessToken: string, permissionId: string, permissionData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/permissions/${permissionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(permissionData),
  });

  return response.json();
};

// Delete permission
export const deletePermission = async (accessToken: string, permissionId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/permissions/${permissionId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// Delete all permissions for a role
export const deletePermissionsByRole = async (accessToken: string, roleId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/permissions/role/${roleId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// ============ PATIENTS API ============

// Get all patients
export const getPatients = async (accessToken: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/patients`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// Get single patient
export const getPatientById = async (accessToken: string, patientId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/patients/${patientId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// Get patient by user ID
export const getPatientByUserId = async (accessToken: string, userId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/patients/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// Create patient
export const createPatient = async (accessToken: string, patientData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(patientData),
  });

  return response.json();
};

// Update patient
export const updatePatient = async (accessToken: string, patientId: string, patientData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/patients/${patientId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(patientData),
  });

  return response.json();
};

// Delete patient
export const deletePatient = async (accessToken: string, patientId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/patients/${patientId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// ============ VITALS API ============

// Get vitals by patient
export const getVitalsByPatient = async (accessToken: string, patientId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/vitals/patient/${patientId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// Get single vital
export const getVitalById = async (accessToken: string, vitalId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/vitals/${vitalId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// Create vital
export const createVital = async (accessToken: string, vitalData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/vitals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(vitalData),
  });

  return response.json();
};

// Update vital
export const updateVital = async (accessToken: string, vitalId: string, vitalData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/vitals/${vitalId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(vitalData),
  });

  return response.json();
};

// Delete vital
export const deleteVital = async (accessToken: string, vitalId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/vitals/${vitalId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// ============ DIAGNOSIS API ============

// Get diagnosis by patient
export const getDiagnosisByPatient = async (accessToken: string, patientId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/diagnosis/patient/${patientId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// Get single diagnosis
export const getDiagnosisById = async (accessToken: string, diagnosisId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/diagnosis/${diagnosisId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};

// Create diagnosis
export const createDiagnosis = async (accessToken: string, diagnosisData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/diagnosis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(diagnosisData),
  });

  return response.json();
};

// Update diagnosis
export const updateDiagnosis = async (accessToken: string, diagnosisId: string, diagnosisData: any): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/diagnosis/${diagnosisId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(diagnosisData),
  });

  return response.json();
};

// Delete diagnosis
export const deleteDiagnosis = async (accessToken: string, diagnosisId: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_URL}/diagnosis/${diagnosisId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  return response.json();
};
