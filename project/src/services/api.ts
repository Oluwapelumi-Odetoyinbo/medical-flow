import axios from "axios"
import type { Patient, RegisterPatientData, NurseNotesData, DoctorNotesData, MedicationData } from "../types/Patient"
import { getAuth, clearAuth } from "../utils/auth"

const API_BASE_URL = "https://medical-record-api-ta4kt.ondigitalocean.app"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const auth = getAuth()
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuth()
      // Force page reload to trigger auth context update
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post("/auth/login", credentials)
    return response.data
  },
}

export const patientAPI = {
  // Register a new patient
  registerPatient: async (data: RegisterPatientData): Promise<Patient> => {
    const response = await api.post("/patients/register", data)
    return response.data
  },

  // Get patients by status
  getPatientsByStatus: async (status: string | undefined): Promise<Patient[]> => {
    const url = status ? `/patients?status=${status}&include=nurseNotes&sort=createdAt` : "/patients?sort=createdAt"
    const response = await api.get(url)
    console.log('API Response for status', status, ':', response.data)
    return response.data
  },

  // Get all patients (for admin)
  getAllPatients: async (): Promise<Patient[]> => {
    const response = await api.get("/patients?sort=createdAt")
    return response.data
  },

  // Update nurse notes
  updateNurseNotes: async (patientId: string, data: NurseNotesData): Promise<Patient> => {
    if (!patientId) throw new Error("Patient ID is required")
    console.log('Sending nurse notes data:', data);
    // Add notes field to match backend expectation
    const response = await api.patch(`/patients/${patientId}/nurse-notes`, {
      notes: data.nurseNotes,
      status: 'awaiting_doctor'
    });
    console.log('Received response:', response.data);
    return response.data;
  },

  // Update doctor notes
  updateDoctorNotes: async (patientId: string, data: DoctorNotesData): Promise<Patient> => {
    if (!patientId) throw new Error("Patient ID is required")
    const response = await api.patch(`/patients/${patientId}/doctor-note`, {
      doctorNote: data // Wrap the data in doctorNote object to match backend expectation
    })
    return response.data
  },

  // Mark medication as dispensed
  updateMedication: async (patientId: string): Promise<Patient> => {
    if (!patientId) throw new Error("Patient ID is required")
    const response = await api.patch(`/patients/${patientId}/medication`, {})
    return response.data
  },

  // Update patient status
  updateStatus: async (patientId: string, status: string): Promise<Patient> => {
    if (!patientId) throw new Error("Patient ID is required")
    const response = await api.patch(`/patients/${patientId}/status`, { status })
    return response.data
  },
}

export default api
