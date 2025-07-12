"use client"

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import Navigation from "./components/layout/Navigation"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import LoginPage from "./pages/LoginPage"
import RegistrationPage from "./pages/RegistrationPage"
import NursePage from "./pages/NursePage"
import DoctorPage from "./pages/DoctorPage"
import PharmacistPage from "./pages/PharmacistPage"
import AdminPage from "./pages/AdminPage"
import { getRoleRedirectPath } from "./utils/auth"

// Dashboard redirect component
const DashboardRedirect = () => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const redirectPath = getRoleRedirectPath(user.role)
  return <Navigate to={redirectPath} replace />
}

function AppContent() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && <Navigation />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Protected Routes */}
        <Route
          path="/registrar"
          element={
            <ProtectedRoute allowedRoles="registrar">
              <RegistrationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nurse"
          element={
            <ProtectedRoute allowedRoles="nurse">
              <NursePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles="doctor">
              <DoctorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pharmacist"
          element={
            <ProtectedRoute allowedRoles="pharmacist">
              <PharmacistPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy routes for backward compatibility */}
        <Route path="/registration" element={<Navigate to="/registrar" replace />} />

        {/* Admin route - accessible by all roles for now */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
