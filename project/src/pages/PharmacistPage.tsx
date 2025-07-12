"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { patientAPI } from "../services/api"
import type { Patient } from "../types/Patient"
import LoadingSpinner from "../components/common/LoadingSpinner"
import EmptyState from "../components/common/EmptyState"
import { Pill, X, CheckCircle } from "lucide-react"

const PharmacistPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const data = await patientAPI.getPatientsByStatus("awaiting_medication")
      setPatients(data)
    } catch (error) {
      console.error("Failed to fetch patients:", error)
      alert("Failed to load patients. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDispenseMedication = async (patient: Patient) => {
    if (!patient.doctorNotes?.instructions) {
      alert("No treatment prescribed by doctor.")
      return
    }

    setSubmitting(true)
    try {
      await patientAPI.updateStatus(patient.id!, "completed")
      setPatients((prev) => prev.filter((p) => p.id !== patient.id))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error("Failed to dispense medication:", error)
      alert("Failed to dispense medication. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient)
    setShowDetailsModal(true)
  }

  if (loading) {
    return <LoadingSpinner text="Loading patients awaiting medication..." />
  }

  const calculateAge = (dateOfBirth: string) => {
    return new Date().getFullYear() - new Date(dateOfBirth).getFullYear()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Alert */}
        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">Medication dispensed successfully!</p>
              </div>
            </div>
          </div>
        )}

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
        </div>

        {patients.length === 0 ? (
          <EmptyState
            icon={Pill}
            title="No patients awaiting medication"
            description="All patients have received their medication or there are no prescriptions from doctors."
          />
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{calculateAge(patient.dateOfBirth)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.address || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.phoneNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Awaiting Medication
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(patient)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDispenseMedication(patient)}
                        className="text-green-600 hover:text-green-900"
                        disabled={submitting}
                      >
                        Dispense
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedPatient && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Patient Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedPatient.nurseNotes && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Nurse Notes</h4>
                    <p className="text-sm text-blue-800">{selectedPatient.nurseNotes}</p>
                  </div>
                )}

                {selectedPatient.doctorNotes && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Doctor's Notes</h4>
                    <div className="space-y-2 text-sm text-green-800">
                      <p><span className="font-medium">Diagnosis:</span> {selectedPatient.doctorNotes.diagnosis}</p>
                      <p><span className="font-medium">Treatment:</span> {selectedPatient.doctorNotes.instructions}</p>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PharmacistPage
