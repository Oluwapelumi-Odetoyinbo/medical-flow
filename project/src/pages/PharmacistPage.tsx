import React, { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';
import { Patient } from '../types/Patient';
import PatientCard from '../components/common/PatientCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import { Pill, Plus, X, Send, Clock } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const PharmacistPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [drugs, setDrugs] = useState<string[]>(['']);
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getPatientsByStatus('awaiting_medication');
      console.log('Fetched patients:', data); // Debug log
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      showErrorToast('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMedication = async () => {
    const validDrugs = drugs.filter(drug => drug.trim());
    
    if (!selectedPatient || validDrugs.length === 0 || !dosage.trim() || !duration.trim()) {
      showErrorToast('Please fill in all medication details before submitting.');
      return;
    }

    const patientId = selectedPatient._id || selectedPatient.id;
    if (!patientId) {
      showErrorToast('Invalid patient ID. Please refresh and try again.');
      return;
    }

    console.log('Submitting medication for patient:', { patientId, selectedPatient }); // Debug log

    setSubmitting(true);
    try {
      await patientAPI.updateMedication(patientId, {
        drugs: validDrugs,
        dosage: dosage.trim(),
        duration: duration.trim(),
      });
      
      // Remove patient from list and reset form
      setPatients(prev => prev.filter(p => {
        const currentId = p._id || p.id;
        return currentId !== patientId;
      }));
      setSelectedPatient(null);
      setDrugs(['']);
      setDosage('');
      setDuration('');
      
      showSuccessToast(`Medication for ${selectedPatient.firstName} ${selectedPatient.lastName} dispensed successfully!`);
    } catch (error) {
      console.error('Failed to submit medication:', error);
      showErrorToast('Failed to dispense medication. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    console.log('Selected patient:', patient); // Debug log
    setSelectedPatient(patient);
    setDrugs(['']);
    setDosage('');
    setDuration('');
    showSuccessToast(`Now dispensing medication for ${patient.firstName} ${patient.lastName}`);
  };

  const addDrugField = () => {
    setDrugs([...drugs, '']);
  };

  const removeDrugField = (index: number) => {
    if (drugs.length > 1) {
      setDrugs(drugs.filter((_, i) => i !== index));
    }
  };

  const updateDrug = (index: number, value: string) => {
    const newDrugs = [...drugs];
    newDrugs[index] = value;
    setDrugs(newDrugs);
  };

  if (loading) {
    return <LoadingSpinner text="Loading patients awaiting medication..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Pill className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pharmacy Station</h1>
              <p className="text-gray-600">Medication dispensing and patient completion</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
              {patients.length} patient{patients.length !== 1 ? 's' : ''} awaiting medication
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Patients List */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Awaiting Medication</h2>
            
            {patients.length === 0 ? (
              <EmptyState
                icon={Pill}
                title="No patients awaiting medication"
                description="All patients have received their medication or there are no prescriptions from doctors."
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
                        className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <Pill className="h-4 w-4" />
                        <span>Dispense Medication</span>
                      </button>
                    </PatientCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Medication Form */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Medication Dispensing</h2>
            
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
                  
                  {selectedPatient.doctorNotes && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="text-sm font-medium text-green-900 mb-2">Doctor's Prescription</h4>
                      <div className="space-y-1 text-sm text-green-800">
                        <p><span className="font-medium">Diagnosis:</span> {selectedPatient.doctorNotes.diagnosis}</p>
                        <p><span className="font-medium">Treatment:</span> {selectedPatient.doctorNotes.treatment}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Pill className="h-4 w-4 inline mr-1" />
                      Medications
                    </label>
                    <div className="space-y-2">
                      {drugs.map((drug, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={drug}
                            onChange={(e) => updateDrug(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                            placeholder="Enter medication name"
                          />
                          {drugs.length > 1 && (
                            <button
                              onClick={() => removeDrugField(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={addDrugField}
                        className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add another medication</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dosage" className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Dosage Instructions
                    </label>
                    <input
                      type="text"
                      id="dosage"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="e.g., 2 tablets twice daily"
                    />
                  </div>

                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Duration
                    </label>
                    <input
                      type="text"
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="e.g., 7 days, 2 weeks, as needed"
                    />
                  </div>

                  <button
                    onClick={handleSubmitMedication}
                    disabled={submitting || !drugs.some(d => d.trim()) || !dosage.trim() || !duration.trim()}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>{submitting ? 'Dispensing...' : 'Complete Treatment'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <EmptyState
                  icon={Pill}
                  title="Select a patient"
                  description="Choose a patient from the list to dispense medication."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistPage;