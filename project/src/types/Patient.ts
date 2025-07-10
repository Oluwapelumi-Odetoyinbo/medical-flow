export interface Patient {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber?: string;
  address?: string;
  status: 'registered' | 'awaiting_doctor' | 'awaiting_medication' | 'completed';
  createdAt: string;
  updatedAt: string;
  age?: number;
  nurseNotes?: string;
  doctorNotes?: {
    diagnosis: string;
    treatment: string;
  };
  medication?: {
    drugs: string[];
    dosage: string;
    duration: string;
  };
  handledBy?: {
    nurse?: string;
    doctor?: string;
    pharmacist?: string;
  };
}

export interface RegisterPatientData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  address: string;
}

export interface NurseNotesData {
  notes: string;
}

export interface DoctorNotesData {
  diagnosis: string;
  treatment: string;
}

export interface MedicationData {
  drugs: string[];
  dosage: string;
  duration: string;
}