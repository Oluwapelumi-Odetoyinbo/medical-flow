import React, { useState, useEffect } from 'react';
import { patientAPI } from '../services/api';
import { Patient } from '../types/Patient';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import { Shield, Search, Filter, BarChart3, Users, TrendingUp } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

const AdminPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm, statusFilter, dateFilter]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientAPI.getAllPatients();
      setPatients(data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      alert('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phoneNumber?.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(filterDate.getMonth() - 1);
          break;
      }
      
      if (dateFilter === 'today') {
        filtered = filtered.filter(patient => {
          const patientDate = new Date(patient.createdAt);
          patientDate.setHours(0, 0, 0, 0);
          return patientDate.getTime() === filterDate.getTime();
        });
      } else if (dateFilter !== 'all') {
        filtered = filtered.filter(patient => 
          new Date(patient.createdAt) >= filterDate
        );
      }
    }

    // Ensure we maintain the original order from the API
    filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    setFilteredPatients(filtered);
  };

  const getStats = () => {
    const total = patients.length;
    const registered = patients.filter(p => p.status === 'registered').length;
    const awaitingDoctor = patients.filter(p => p.status === 'awaiting_doctor').length;
    const awaitingMedication = patients.filter(p => p.status === 'awaiting_medication').length;
    const completed = patients.filter(p => p.status === 'completed').length;

    return { total, registered, awaitingDoctor, awaitingMedication, completed };
  };

  const stats = getStats();

  if (loading) {
    return <LoadingSpinner text="Loading patient records..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Complete patient management and system overview</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Registered</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.registered}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Awaiting Doctor</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.awaitingDoctor}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Awaiting Medication</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.awaitingMedication}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Search className="h-4 w-4 inline mr-1" />
                  Search Patients
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Search by name or phone..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="h-4 w-4 inline mr-1" />
                  Status Filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Statuses</option>
                  <option value="registered">Registered</option>
                  <option value="awaiting_doctor">Awaiting Doctor</option>
                  <option value="awaiting_medication">Awaiting Medication</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BarChart3 className="h-4 w-4 inline mr-1" />
                  Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredPatients.length} of {patients.length} patients
            </div>
          </div>
        </div>

        {/* Replace Patient Cards with Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-lg font-semibold text-gray-900 p-4 border-b">Patient Records</h2>
          
          {filteredPatients.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title={patients.length === 0 ? "No patients found" : "No patients match your filters"}
                description={patients.length === 0 ? "No patients have been registered in the system yet." : "Try adjusting your search criteria or filters."}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Info
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{patient.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={patient.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;