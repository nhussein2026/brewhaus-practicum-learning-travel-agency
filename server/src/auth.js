import 'dotenv/config'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { db } from './db/index.js'
import * as schema from './db/schema.js'

export const auth = betterAuth({
  // better-auth stores users, sessions and hashed passwords in our Postgres tables.
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },
  // A session lasts 7 days and is refreshed once a day while in use.
  // It lives in the database and in an httpOnly cookie, so a page refresh keeps you signed in.
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [process.env.CLIENT_URL ?? 'http://localhost:5173'],
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
})
