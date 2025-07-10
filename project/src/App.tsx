import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navigation from './components/layout/Navigation';
import RegistrationPage from './pages/RegistrationPage';
import NursePage from './pages/NursePage';
import DoctorPage from './pages/DoctorPage';
import PharmacistPage from './pages/PharmacistPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Toaster />
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to="/registration" replace />} />
          <Route path="/registration" element={<RegistrationPage />} />
          <Route path="/nurse" element={<NursePage />} />
          <Route path="/doctor" element={<DoctorPage />} />
          <Route path="/pharmacist" element={<PharmacistPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;