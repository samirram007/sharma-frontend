import { useContext } from 'react'
import { AuthContext, type AuthContextType } from '@/features/auth/contexts/AuthContext'

const fallback: AuthContextType = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  permissions: [],
  userFiscalYear: null,
  period: null,
  setPeriod: () => {},
  login: async () => {},
  logout: async () => {},
  fetchProfile: async () => {},
  menuTree: [],
}

/**
 * Safe wrapper around useAuth that returns fallback values instead of throwing
 * when rendered outside AuthProvider (e.g., during error boundary catches).
 */
export function useAuthSafe(): AuthContextType {
  const context = useContext(AuthContext)
  return context ?? fallback
}
