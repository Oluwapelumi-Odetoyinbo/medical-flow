import React, { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';
import { Patient } from '../types/Patient';
import PatientCard from '../components/common/PatientCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Stethoscope, ClipboardList, Send, FileText } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const DoctorPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getPatientsByStatus('awaiting_doctor');
      console.log('Fetched patients:', data); // Debug log
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      showErrorToast('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDoctorNotes = async () => {
    if (!selectedPatient || !diagnosis.trim() || !treatment.trim()) {
      showErrorToast('Please fill in both diagnosis and treatment before submitting.');
      return;
    }

    const patientId = selectedPatient._id || selectedPatient.id;
    if (!patientId) {
      showErrorToast('Invalid patient ID. Please refresh and try again.');
      return;
    }

    console.log('Submitting notes for patient:', { patientId, selectedPatient }); // Debug log

    setSubmitting(true);
    try {
      await patientAPI.updateDoctorNotes(patientId, {
        diagnosis: diagnosis.trim(),
        treatment: treatment.trim(),
      });
      
      // Remove patient from list and reset form
      setPatients(prev => prev.filter(p => {
        const currentId = p._id || p.id;
        return currentId !== patientId;
      }));
      setSelectedPatient(null);
      setDiagnosis('');
      setTreatment('');
      
      showSuccessToast(`Consultation for ${selectedPatient.firstName} ${selectedPatient.lastName} submitted successfully!`);
    } catch (error) {
      console.error('Failed to submit doctor notes:', error);
      showErrorToast('Failed to submit consultation notes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    console.log('Selected patient:', patient); // Debug log
    setSelectedPatient(patient);
    setDiagnosis('');
    setTreatment('');
    showSuccessToast(`Now consulting ${patient.firstName} ${patient.lastName}`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading patients awaiting doctor..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <Stethoscope className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Doctor Consultation</h1>
              <p className="text-gray-600">Patient diagnosis and treatment planning</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
              {patients.length} patient{patients.length !== 1 ? 's' : ''} awaiting consultation
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patients List */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Awaiting Consultation</h2>
            
            {patients.length === 0 ? (
              <EmptyState
                icon={Stethoscope}
                title="No patients awaiting consultation"
                description="All patients have been seen or there are no referrals from the nurse station."
              />
            ) : (
              <div className="space-y-4">
                {patients.map((patient) => {
                  const patientId = patient._id || patient.id;
                  return (
                    <PatientCard
                      key={patientId}
                      patient={patient}
                      onClick={() => handleSelectPatient(patient)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPatient(patient);
                        }}
                        className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <ClipboardList className="h-4 w-4" />
                        <span>Diagnose & Treat</span>
                      </button>
                    </PatientCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Consultation Form */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Consultation</h2>
            
            {selectedPatient ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>Age: {new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} years</p>
                    <p>Phone: {selectedPatient.phoneNumber}</p>
                  </div>
                  
                  {selectedPatient.nurseNotes && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Nurse Assessment
                      </h4>
                      <p className="text-sm text-blue-800">{selectedPatient.nurseNotes}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
                      <ClipboardList className="h-4 w-4 inline mr-1" />
                      Diagnosis
                    </label>
                    <textarea
                      id="diagnosis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                      placeholder="Enter primary and secondary diagnosis..."
                    />
                  </div>

                  <div>
                    <label htmlFor="treatment" className="block text-sm font-medium text-gray-700 mb-2">
                      <Stethoscope className="h-4 w-4 inline mr-1" />
                      Treatment & Instructions
                    </label>
                    <textarea
                      id="treatment"
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                      placeholder="Enter treatment plan, instructions, and recommendations..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Include medication requirements, lifestyle changes, and follow-up instructions.
                    </p>
                  </div>

                  <button
                    onClick={handleSubmitDoctorNotes}
                    disabled={submitting || !diagnosis.trim() || !treatment.trim()}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submitting ? 'Submitting...' : 'Submit Consultation'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <EmptyState
                  icon={ClipboardList}
                  title="Select a patient"
                  description="Choose a patient from the list to begin consultation."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPage;