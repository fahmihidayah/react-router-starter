import { createAuthClient } from 'better-auth/react'
import { authLogger } from '~/utils/logger'

// Get base URL - always use current origin in browser
// This ensures auth requests go to the same server serving the app
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Use the current origin (protocol + host)
    return window.location.origin
  }

  // Fallback for SSR (shouldn't be called client-side)
  return 'http://localhost:5173'
}

const baseURL = getBaseURL()

authLogger.info('Initializing auth client', { baseURL })

export const authClient = createAuthClient({
  baseURL,
})

authLogger.info('Auth client initialized successfully')

export const { signIn, signUp, signOut, useSession } = authClient
