import React from 'react';
import { Patient } from '../../types/Patient';
import { calculateAge, formatDateTime } from '../../utils/dateUtils';
import StatusBadge from './StatusBadge';
import { Calendar, Phone, MapPin, Clock } from 'lucide-react';

interface PatientCardProps {
  patient: Patient;
  children?: React.ReactNode;
  onClick?: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, children, onClick }) => {
  const age = calculateAge(patient.dateOfBirth);

  return (
    <div 
      className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-blue-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {patient.firstName} {patient.lastName}
          </h3>
          <p className="text-sm text-gray-600 flex items-center mt-1">
            <Calendar className="h-4 w-4 mr-1" />
            Age: {age} years
          </p>
        </div>
        <StatusBadge status={patient.status} />
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        {patient.phoneNumber && (
          <p className="flex items-center">
            <Phone className="h-4 w-4 mr-2" />
            {patient.phoneNumber}
          </p>
        )}
        {patient.address && (
          <p className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {patient.address}
          </p>
        )}
        <p className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Registered: {formatDateTime(patient.createdAt)}
        </p>
      </div>

      {patient.nurseNotes && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Nurse Notes:</h4>
          <p className="text-sm text-blue-800">{patient.nurseNotes}</p>
        </div>
      )}

      {patient.doctorNotes && (
        <div className="mt-4 p-3 bg-green-50 rounded-md">
          <h4 className="text-sm font-medium text-green-900 mb-2">Doctor Notes:</h4>
          <div className="space-y-1 text-sm text-green-800">
            <p><span className="font-medium">Diagnosis:</span> {patient.doctorNotes.diagnosis}</p>
            <p><span className="font-medium">Treatment:</span> {patient.doctorNotes.treatment}</p>
          </div>
        </div>
      )}

      {patient.medication && (
        <div className="mt-4 p-3 bg-purple-50 rounded-md">
          <h4 className="text-sm font-medium text-purple-900 mb-2">Medication:</h4>
          <div className="space-y-1 text-sm text-purple-800">
            <p><span className="font-medium">Drugs:</span> {patient.medication.drugs.join(', ')}</p>
            <p><span className="font-medium">Dosage:</span> {patient.medication.dosage}</p>
            <p><span className="font-medium">Duration:</span> {patient.medication.duration}</p>
          </div>
        </div>
      )}

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default PatientCard;