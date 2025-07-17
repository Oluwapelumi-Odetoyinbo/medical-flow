"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { patientAPI } from "../services/api"
import type { Patient } from "../types/Patient"
import LoadingSpinner from "../components/common/LoadingSpinner"
import EmptyState from "../components/common/EmptyState"
import { Heart, FileText, Send, CheckCircle, Search, X } from "lucide-react"

const NursePage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const data = await patientAPI.getAllPatients()
      setPatients(data)
    } catch (error) {
      console.error("Failed to fetch patients:", error)
      alert("Failed to load patients. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients
    .filter((patient) => {
      const matchesSearch = 
        searchTerm === "" ||
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNumber?.includes(searchTerm) ||
        patient.address?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = 
        statusFilter === "all" || patient.status === statusFilter

      return matchesSearch && matchesStatus
    })
    // Ensure we maintain the original order from the API
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  const handleSubmitNotes = async () => {
    if (!selectedPatient || !notes.trim()) {
      alert("Please enter notes before submitting.")
      return
    }

    setSubmitting(true)
    try {
      // Send nurseNotes to match the API expectation
      await patientAPI.updateNurseNotes(selectedPatient._id, { nurseNotes: notes.trim() })

      // Remove patient from list and reset form
      setPatients((prev) => prev.filter((p) => p._id !== selectedPatient._id))
      setSelectedPatient(null)
      setNotes("")
      setIsModalOpen(false)

      // Show success message
      setSuccess(true)
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error("Failed to submit notes:", error)
      alert("Failed to submit notes. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setNotes("")
    setIsModalOpen(true)
  }

  if (loading) {
    return <LoadingSpinner text="Loading registered patients..." />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Success Alert */}
      {success && (
        <div className="mb-6 max-w-7xl mx-auto rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Assessment submitted successfully!</p>
              <p className="text-sm text-green-700 mt-1">
                Patient has been moved to the doctor queue for consultation.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
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
              {statusFilter === "all" 
                ? `${patients.length} total patient${patients.length !== 1 ? "s" : ""}`
                : `${filteredPatients.length} ${statusFilter.replace('_', ' ')} patient${filteredPatients.length !== 1 ? "s" : ""}`
              }
            </span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none"
            >
              <option value="all">All Status</option>
              <option value="registered">Registered</option>
              <option value="awaiting_doctor">Awaiting Doctor</option>
              <option value="awaiting_medication">Awaiting Medication</option>
              <option value="completed">Completed</option>
            </select>
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
                            icon={Heart}
                            title="No registered patients"
                            description="All registered patients have been processed or there are no new registrations."
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
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              patient.status === 'registered' ? 'bg-blue-100 text-blue-800' :
                              patient.status === 'awaiting_doctor' ? 'bg-yellow-100 text-yellow-800' :
                              patient.status === 'awaiting_medication' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {patient.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            {patient.status === 'registered' && (
                              <button
                                onClick={() => handleSelectPatient(patient)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Add Vitals
                              </button>
                            )}
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

      {/* Vitals Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Patient Assessment</h2>
                  <p className="text-sm text-gray-600">Add vitals</p>
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
                    <div className="text-sm text-gray-600">
                      <p>Age: {new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear()} years</p>
                      <p>Phone: {selectedPatient.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="h-4 w-4 inline mr-1" />
                       Vitals Notes
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

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitNotes}
                      disabled={submitting || !notes.trim()}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>{submitting ? "Submitting..." : "Submit Assessment"}</span>
                    </button>
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

export default NursePage
