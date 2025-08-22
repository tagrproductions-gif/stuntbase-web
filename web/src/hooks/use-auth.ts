'use client'

import { useAuth } from '@/lib/auth-context'

// Re-export for convenience
export { useAuth } from '@/lib/auth-context'

// Additional auth-related hooks can go here
export function useRequireAuth() {
  const { user, loading } = useAuth()
  
  return {
    user,
    loading,
    isAuthenticated: !!user,
    requireAuth: !loading && !user
  }
}
