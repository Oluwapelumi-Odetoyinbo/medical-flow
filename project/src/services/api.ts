import axios from 'axios';
import { Patient, RegisterPatientData, NurseNotesData, DoctorNotesData, MedicationData } from '../types/Patient';

const API_BASE_URL = 'https://medical-record-q3r7.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to get the correct ID from a patient
const getPatientId = (patient: Patient): string => {
  if (!patient._id && !patient.id) {
    throw new Error('Patient has no valid ID');
  }
  return patient._id || patient.id || '';
};

export const patientAPI = {
  // Register a new patient
  registerPatient: async (data: RegisterPatientData): Promise<Patient> => {
    const response = await api.post('/patients/register', data);
    return response.data;
  },

  // Get patients by status
  getPatientsByStatus: async (status: string): Promise<Patient[]> => {
    const response = await api.get(`/patients?status=${status}`);
    return response.data;
  },

  // Get all patients (for admin)
  getAllPatients: async (): Promise<Patient[]> => {
    const response = await api.get('/patients');
    return response.data;
  },

  // Update nurse notes
  updateNurseNotes: async (patientId: string, data: NurseNotesData): Promise<Patient> => {
    if (!patientId) {
      throw new Error('Patient ID is required');
    }
    const response = await api.patch(`/patients/${patientId}/nurse-notes`, data);
    return response.data;
  },

  // Update doctor notes
  updateDoctorNotes: async (patientId: string, data: DoctorNotesData): Promise<Patient> => {
    if (!patientId) {
      throw new Error('Patient ID is required');
    }
    const response = await api.patch(`/patients/${patientId}/doctor-note`, data);
    return response.data;
  },

  // Update medication
  updateMedication: async (patientId: string, data: MedicationData): Promise<Patient> => {
    if (!patientId) {
      throw new Error('Patient ID is required');
    }
    const response = await api.patch(`/patients/${patientId}/medication`, data);
    return response.data;
  },
};

export default api;