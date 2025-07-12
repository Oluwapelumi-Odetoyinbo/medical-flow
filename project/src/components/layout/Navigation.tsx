"use client"

import type React from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { UserPlus, Stethoscope, Heart, Pill, Activity, LogOut, User } from "lucide-react"
import { useAuth } from "../../context/AuthContext"

const Navigation: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  if (!user) {
    return null
  }

  const getRoleNavItems = () => {
    switch (user.role) {
      case "registrar":
        return [
          {
            path: "/registrar",
            label: "Registration",
            icon: UserPlus,
            description: "Register new patients",
          },
        ]
      case "nurse":
        return [
          {
            path: "/nurse",
            label: "Nurse Station",
            icon: Heart,
            description: "Patient assessment",
          },
        ]
      case "doctor":
        return [
          {
            path: "/doctor",
            label: "Doctor Console",
            icon: Stethoscope,
            description: "Diagnosis & treatment",
          },
        ]
      case "pharmacist":
        return [
          {
            path: "/pharmacist",
            label: "Pharmacy",
            icon: Pill,
            description: "Medication management",
          },
        ]
      default:
        return []
    }
  }

  const navItems = getRoleNavItems()

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">MedFlow System</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation Items */}
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-blue-100 text-blue-700 shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`
                    }
                    title={item.description}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:block">{item.label}</span>
                  </NavLink>
                )
              })}
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="hidden sm:block">
                  {user.username} ({user.role})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
