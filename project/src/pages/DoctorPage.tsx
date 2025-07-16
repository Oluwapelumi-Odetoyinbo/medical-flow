"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { patientAPI } from "../services/api"
import type { Patient } from "../types/Patient"
import LoadingSpinner from "../components/common/LoadingSpinner"
import EmptyState from "../components/common/EmptyState"
import { Stethoscope, ClipboardList, Send, FileText, CheckCircle, Search, X } from "lucide-react"

const DoctorPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [diagnosis, setDiagnosis] = useState("")
  const [instructions, setInstructions] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const data = await patientAPI.getPatientsByStatus("awaiting_doctor")
      setPatients(data)
    } catch (error) {
      console.error("Failed to fetch patients:", error)
      alert("Failed to load patients. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitDoctorNotes = async () => {
    if (!selectedPatient || !selectedPatient._id || !instructions.trim()) {
      alert("Please fill in treatment instructions before submitting.")
      return
    }

    setSubmitting(true)
    try {
      // Add type assertion since we've checked _id exists
      await patientAPI.updateDoctorNotes(selectedPatient._id as string, {
        diagnosis: diagnosis.trim() || "No diagnosis provided",
        instructions: instructions.trim(),
      })

      // Remove patient from list and reset form
      setPatients((prev) => prev.filter((p) => p._id !== selectedPatient._id))
      setSelectedPatient(null)
      setDiagnosis("")
      setInstructions("")
      setIsModalOpen(false)

      // Show success message
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error("Failed to submit doctor notes:", error)
      alert("Failed to submit notes. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setDiagnosis("")
    setInstructions("")
    setIsModalOpen(true)
  }

  const filteredPatients = patients.filter((patient) =>
    searchTerm === "" ||
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phoneNumber?.includes(searchTerm) ||
    patient.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <LoadingSpinner text="Loading patients awaiting doctor..." />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Success Alert */}
      {success && (
        <div className="mb-6 max-w-7xl mx-auto rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Consultation completed successfully!</p>
              <p className="text-sm text-green-700 mt-1">
                Patient has been moved to the pharmacy queue for medication dispensing.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
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
              {patients.length} patient{patients.length !== 1 ? "s" : ""} awaiting consultation
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 mb-6">
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Patients Table */}
        <div className="mt-6 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Age</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Address</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-4 text-sm text-gray-500 text-center">
                          <EmptyState
                            icon={Stethoscope}
                            title="No patients awaiting consultation"
                            description="All patients have been seen or there are no referrals from the nurse station."
                          />
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((patient) => (
                        <tr key={patient._id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                            <div className="font-medium text-gray-900">{`${patient.firstName} ${patient.lastName}`}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {patient.address}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {patient.phoneNumber}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className="inline-flex rounded-full px-2 text-xs font-semibold leading-5 bg-yellow-100 text-yellow-800">
                              {patient.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <button
                              onClick={() => handleSelectPatient(patient)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <ClipboardList className="h-4 w-4 mr-1" />
                              Consult
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Patient Consultation</h2>
                  <p className="text-sm text-gray-600">Review nurse notes and add consultation details</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {selectedPatient && (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h3>
                    <div className="text-sm text-gray-600 mb-4">
                      <p>Age: {new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} years</p>
                      <p>Phone: {selectedPatient.phoneNumber}</p>
                    </div>

                    {/* Nurse Notes Section - Always show the section */}
                    <div className="p-4 bg-blue-50 rounded-lg mb-6">
                      <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Nurse Assessment Notes
                      </h4>
                      {selectedPatient.nurseNotes ? (
                        <div>
                          <p className="text-sm text-blue-800 whitespace-pre-wrap font-medium mb-2">Vitals:</p>
                          <p className="text-sm text-blue-800 whitespace-pre-wrap">{selectedPatient.nurseNotes}</p>
                        </div>
                      ) : (
                        <div className="text-sm text-blue-800">
                          <p className="italic">No nurse notes available</p>
                          <p className="mt-1 text-xs">Patient may still be waiting for nurse assessment</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-2">
                        <ClipboardList className="h-4 w-4 inline mr-1" />
                        Diagnosis (Optional)
                      </label>
                      <textarea
                        id="diagnosis"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                        placeholder="Enter primary and secondary diagnosis (optional)..."
                      />
                    </div>

                    <div>
                      <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
                        <Stethoscope className="h-4 w-4 inline mr-1" />
                        Instructions
                      </label>
                      <textarea
                        id="instructions"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                        placeholder="Enter treatment instructions and recommendations..."
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Include medication requirements, lifestyle changes, and follow-up instructions.
                      </p>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitDoctorNotes}
                        disabled={submitting || !instructions.trim()}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>{submitting ? "Submitting..." : "Submit Consultation"}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorPage
