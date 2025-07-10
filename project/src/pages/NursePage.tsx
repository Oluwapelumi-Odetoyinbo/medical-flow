import React, { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';
import { Patient } from '../types/Patient';
import PatientCard from '../components/common/PatientCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Heart, FileText, Send } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const NursePage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getPatientsByStatus('registered');
      console.log('Fetched patients:', data); // Debug log
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      showErrorToast('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNotes = async () => {
    if (!selectedPatient || !notes.trim()) {
      showErrorToast('Please enter assessment notes before submitting.');
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
      await patientAPI.updateNurseNotes(patientId, { notes: notes.trim() });
      
      // Remove patient from list and reset form
      setPatients(prev => prev.filter(p => {
        const currentId = p._id || p.id;
        return currentId !== patientId;
      }));
      setSelectedPatient(null);
      setNotes('');
      
      showSuccessToast(`Assessment for ${selectedPatient.firstName} ${selectedPatient.lastName} submitted successfully!`);
    } catch (error) {
      console.error('Failed to submit notes:', error);
      showErrorToast('Failed to submit assessment notes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    console.log('Selected patient:', patient); // Debug log
    setSelectedPatient(patient);
    setNotes('');
    showSuccessToast(`Now assessing ${patient.firstName} ${patient.lastName}`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading registered patients..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-red-100 rounded-lg">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nurse Station</h1>
              <p className="text-gray-600">Initial patient assessment and note-taking</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
              {patients.length} registered patient{patients.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patients List */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Registered Patients</h2>
            
            {patients.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No registered patients"
                description="All registered patients have been processed or there are no new registrations."
              />
            ) : (
              <div className="space-y-4">
                {patients.map((patient) => (
                  <PatientCard
                    key={patient.id}
                    patient={patient}
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPatient(patient);
                      }}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Add Assessment</span>
                    </button>
                  </PatientCard>
                ))}
              </div>
            )}
          </div>

          {/* Assessment Form */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Assessment</h2>
            
            {selectedPatient ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h3>
                  <div className="text-sm text-gray-600">
                    <p>Age: {new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} years</p>
                    <p>Phone: {selectedPatient.phoneNumber}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="h-4 w-4 inline mr-1" />
                    Assessment Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Enter patient vitals, symptoms, and initial observations..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Include vital signs, chief complaints, symptoms, and initial observations.
                  </p>
                </div>

                <button
                  onClick={handleSubmitNotes}
                  disabled={submitting || !notes.trim()}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{submitting ? 'Submitting...' : 'Submit Assessment'}</span>
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <EmptyState
                  icon={FileText}
                  title="Select a patient"
                  description="Choose a patient from the list to begin their assessment."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NursePage;