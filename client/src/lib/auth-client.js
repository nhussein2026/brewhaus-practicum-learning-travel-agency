import { createAuthClient } from 'better-auth/react'

// Talks to the better-auth routes on our API (/api/auth/*).
// Same origin as the page: Vite proxies /api in development, Vercel rewrites it in production.
export const authClient = createAuthClient({
  baseURL: window.location.origin,
})

export const { signIn, signUp, signOut, useSession } = authClient
