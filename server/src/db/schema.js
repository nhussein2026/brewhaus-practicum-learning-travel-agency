import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core'

// ---------------------------------------------------------------------------
// Auth tables: the shape better-auth expects. better-auth reads and writes
// these; our own code never touches them directly.
// ---------------------------------------------------------------------------

// One row per person who signed up.
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// One row per signed-in browser. The token is what the session cookie holds.
export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

// How a user logs in. For email + password, the hashed password lives here.
export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// Short-lived codes (e.g. email verification, password reset).
export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// Our data: one row per tour package shown on the site.
// ---------------------------------------------------------------------------
export const tours = pgTable('tours', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(), // e.g. 'sunny-santorini'; lets the seed script skip tours that already exist
  name: text('name').notNull(),
  country: text('country').notNull(),
  region: text('region').notNull(), // 'Europe' | 'Asia' | 'Middle East', used by the filter
  days: integer('days').notNull(),
  price: integer('price').notNull(), // starting price per traveler, whole US dollars
  imageUrl: text('image_url').notNull(),
  imageAlt: text('image_alt').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
