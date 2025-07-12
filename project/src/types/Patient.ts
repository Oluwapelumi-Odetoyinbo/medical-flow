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
      doctorNote?: {
      diagnosis: string;
      instructions: string;
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
  nurseNotes: string; // Backend expects 'nurseNotes' not 'nurseNote'
}

export interface DoctorNotesData {
  diagnosis: string;
  instructions: string;
}

export interface MedicationData {
  drugs: string[];
  dosage: string;
  duration: string;
}