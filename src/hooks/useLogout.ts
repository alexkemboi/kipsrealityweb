'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface UseLogoutOptions {
  redirectTo?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useLogout(options: UseLogoutOptions = {}) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { redirectTo = '/', onSuccess, onError } = options

  const logout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)

    try {
      const response = await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // Ensure cookies are sent
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      // Clear client-side state
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      
      // You can also clear other app-specific data
      // localStorage.removeItem('user')
      // sessionStorage.clear()

      onSuccess?.()
      router.push(redirectTo)
      router.refresh() // Refresh server components
    } catch (error) {
      console.error('Logout error:', error)
      onError?.(error instanceof Error ? error : new Error('Logout failed'))
    } finally {
      setIsLoggingOut(false)
    }
  }

  return { logout, isLoggingOut }
}