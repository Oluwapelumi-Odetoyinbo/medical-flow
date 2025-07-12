"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "../utils/auth"
import { getAuth, saveAuth as saveAuthToStorage, clearAuth as clearAuthFromStorage } from "../utils/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing auth on mount
    const existingAuth = getAuth()
    console.log("Initial auth check:", existingAuth)
    if (existingAuth) {
      setUser(existingAuth)
    }
    setLoading(false)
  }, [])

  const login = (userData: User) => {
    console.log("AuthContext: Logging in with data:", userData)
    saveAuthToStorage(userData)
    setUser(userData)
  }

  const logout = () => {
    console.log("AuthContext: Logging out")
    clearAuthFromStorage()
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  }

  console.log("AuthContext current state:", { user, isAuthenticated: !!user, loading })

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
