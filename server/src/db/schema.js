import { pgTable, serial, text, integer, boolean, timestamp, unique } from 'drizzle-orm/pg-core'

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
// Our data: one row per tour (or transfer) we sell.
// Everything that does NOT depend on the language lives here. The words
// (name, description, ...) live in tour_translations, one row per language.
// ---------------------------------------------------------------------------
export const tours = pgTable('tours', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(), // e.g. 'pokut-sal-sunset'; used in the URL /tours/:slug
  category: text('category').notNull().default('day'), // 'day' | 'hiking' | 'private' | 'transfer', used by the filter
  price: integer('price').notNull(), // whole Turkish lira (TRY)
  priceUnit: text('price_unit').notNull().default('person'), // 'person' (price × travelers) | 'vehicle' (one price for the group)
  maxGuests: integer('max_guests').notNull().default(10), // group size limit, e.g. the 8 seats of a VIP van
  imageUrl: text('image_url').notNull(),
  // Where the photo came from, for the credits page (most open licences require it).
  imageAuthor: text('image_author'),
  imageLicense: text('image_license'), // e.g. 'CC BY-SA 4.0'
  imageLicenseUrl: text('image_license_url'),
  imageSourceUrl: text('image_source_url'),
  sortOrder: integer('sort_order').notNull().default(0),
  // Tours are archived, never deleted: old orders still point at them.
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

// The words for one tour in one language. Adding a language later (e.g. Arabic)
// means adding rows, not changing the table.
export const tourTranslations = pgTable(
  'tour_translations',
  {
    id: serial('id').primaryKey(),
    tourId: integer('tour_id').notNull().references(() => tours.id, { onDelete: 'cascade' }),
    locale: text('locale').notNull(), // 'en' | 'tr'
    name: text('name').notNull(),
    summary: text('summary').notNull(), // one line for the tour card
    duration: text('duration').notNull(), // e.g. 'Full day · about 9 hours'
    description: text('description').notNull(),
    highlights: text('highlights').array().notNull(),
    included: text('included').array().notNull(),
    imageAlt: text('image_alt').notNull(),
  },
  // At most one translation per tour per language.
  (table) => [unique('tour_translations_tour_locale').on(table.tourId, table.locale)],
)

// ---------------------------------------------------------------------------
// Orders: one row per checkout attempt. It starts as 'pending' and only the
// Stripe webhook may change it to 'paid' (or 'expired' if checkout times out).
// ---------------------------------------------------------------------------
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'), // 'pending' | 'paid' | 'expired'
  total: integer('total').notNull(), // whole units of `currency`, worked out on the server
  currency: text('currency').notNull().default('try'), // an amount without its currency is ambiguous
  stripeSessionId: text('stripe_session_id').unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  paidAt: timestamp('paid_at'),
})

// What was bought in an order, and at what price at that moment.
// unitPrice is copied from the tour, so later price changes don't rewrite old orders.
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  tourId: integer('tour_id').notNull().references(() => tours.id),
  travelers: integer('travelers').notNull(),
  unitPrice: integer('unit_price').notNull(), // the tour's price at that moment
  priceUnit: text('price_unit').notNull().default('person'), // copied too: 'person' or 'vehicle'
})
