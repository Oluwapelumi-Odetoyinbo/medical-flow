export interface User {
  token: string
  role: "registrar" | "nurse" | "doctor" | "pharmacist"
  username?: string
}

export const AUTH_STORAGE_KEY = "medflow_auth"

export const saveAuth = (user: User): void => {
  console.log("Saving auth to storage:", user)
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

export const getAuth = (): User | null => {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  console.log("Getting auth from storage:", stored)
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored)
    console.log("Parsed auth data:", parsed)
    return parsed
  } catch (error) {
    console.error("Error parsing auth data:", error)
    return null
  }
}

export const clearAuth = (): void => {
  console.log("Clearing auth from storage")
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const isAuthenticated = (): boolean => {
  const auth = getAuth()
  return !!auth?.token
}

export const hasRole = (requiredRole: string | string[]): boolean => {
  const auth = getAuth()
  if (!auth) return false

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(auth.role)
  }

  return auth.role === requiredRole
}

export const getRoleRedirectPath = (role: string): string => {
  switch (role) {
    case "registrar":
      return "/registrar"
    case "nurse":
      return "/nurse"
    case "doctor":
      return "/doctor"
    case "pharmacist":
      return "/pharmacist"
    default:
      return "/login"
  }
}
