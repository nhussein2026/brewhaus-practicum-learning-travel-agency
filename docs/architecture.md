# Architecture

How the database, sign-in, payments and API fit together. Back to the [README](../README.md).

## Database schema (in plain English)

| Table | One row is… | Key columns |
|---|---|---|
| `user` | a person who signed up | `id`, `name`, `email` (unique) |
| `account` | how that user logs in. For email + password, it holds the **hashed** password | `user_id` → `user.id`, `provider_id` = `credential`, `password` |
| `session` | one signed-in browser | `token` (stored in the cookie), `expires_at`, `user_id` → `user.id` |
| `verification` | a short-lived code (email verification / password reset). Not used yet | `identifier`, `value`, `expires_at` |
| `tours` | one tour or transfer we sell (the language-free part) | `id`, `slug` (unique, used in `/tours/:slug`), `category` (`day` / `hiking` / `private` / `transfer`), `price` (whole TRY), `price_unit` (`person` / `vehicle`), `max_guests`, `image_url`, `image_author` / `image_license` / `image_license_url` / `image_source_url`, `sort_order`, `active` |
| `tour_translations` | the words for one tour in one language | `tour_id` → `tours.id`, `locale` (`en` / `tr`), `name`, `summary`, `duration`, `description`, `highlights[]`, `included[]`, `image_alt`. Unique per (`tour_id`, `locale`) |
| `orders` | one checkout by one user | `id`, `user_id` → `user.id`, `status` (`pending` → `paid`, or `expired`), `total`, `currency` (`try`), `stripe_session_id` (unique), `created_at`, `paid_at` |
| `order_items` | what was bought in an order, and at what price | `order_id` → `orders.id`, `tour_id` → `tours.id`, `travelers`, `unit_price` and `price_unit` (both copied from the tour at purchase time) |

- **One user can have many sessions**, for example a laptop and a phone. Deleting a user deletes their sessions and accounts too (`on delete cascade`).
- **One user has many orders, and one order has many items.** Booking Santorini for 2 and Kyoto for 3 in one checkout makes **one** `orders` row and **two** `order_items` rows.
- `unit_price` is **copied** into `order_items`. If a tour's price changes later, old orders still show what the customer actually paid.
- **Translations live in their own table**, one row per tour per language. Adding Arabic later means adding rows, not columns. If a translation is missing, the API falls back to English.
- **Tours are archived (`active = false`), never deleted.** Old orders point at them through a foreign key. The API only lists and sells active tours.
- **Two price units.** `person`: price × travelers (group tours). `vehicle`: one price for the whole van up to `max_guests` (private tours and transfers). The rule is `lineTotal()` in `server/src/lib/pricing.js`.
- better-auth owns the four auth tables. Our own code works with `tours`, `tour_translations`, `orders` and `order_items`.

## How auth works

1. **Sign-up / sign-in.** `AuthForm` calls `signUp.email(...)` or `signIn.email(...)` from `client/src/lib/auth-client.js`, which sends a POST to `/api/auth/sign-up/email` or `/api/auth/sign-in/email`.
2. **On the server**, `app.all('/api/auth/*splat', toNodeHandler(auth))` hands the request to better-auth. better-auth then:
   - hashes the password,
   - creates rows in `user` and `account`,
   - creates a row in `session`,
   - sends back an **httpOnly cookie** holding the session token. Page JavaScript can't read an httpOnly cookie, which protects it.
3. **Signed-in state.** `useSession()` in `Header` calls `/api/auth/get-session`. The browser sends the cookie automatically, and the server finds the matching `session` row. The header shows **"Hi, name · Sign out"** or **"Sign in"**.
4. **Refresh-proof.** The session lives in the database and the cookie lasts 7 days, so a page refresh keeps you signed in.
5. **Sign out** calls `/api/auth/sign-out`. That deletes the session row and clears the cookie.

**Why `/api` is always same-origin:**
- In development, Vite proxies `/api` to `localhost:3001`.
- In production, `vercel.json` rewrites `/api/*` to Railway.

So the browser only ever talks to one domain, and cookies just work. The frontend needs no environment variables.

---
## How payments work (Stripe Checkout, test mode)

```
Browser                         Our API                                  Stripe
───────                         ───────                                  ──────
"Add to trip plan" on one or more tours (kept in the browser, nothing paid)
/booking: review tours, travelers, totals
"Proceed to payment" ── POST /api/checkout {items: [{tourId, travelers}, ...]} ──▶
                                requireAuth: signed in? (else 401)
                                look up every tour's REAL price in Postgres
                                insert ONE order (pending) + one order_items row per tour
                                create Checkout Session ───────────────▶
                         ◀───── { url } ◀──────────────────────────────── session.url
redirect to Stripe ───────────────────────────────────────────────────▶ hosted payment page
                                                                         card 4242 4242 4242 4242
                                POST /api/stripe/webhook ◀────────────── checkout.session.completed
                                verify Stripe signature
                                order → 'paid'
redirect to /checkout/success?order=ID ◀────────────────────────────────
CheckoutSuccess polls GET /api/orders/ID until status = 'paid'
```

0. **The trip plan (cart).** `client/src/lib/trip-plan.jsx` holds the chosen tours as `[{ tourId, travelers }]`.
   - It's shared with React **context**, so `TourCard` (Add to trip plan), `Header` (My trip count) and `BookingPage` all see the same list.
   - It's copied into `localStorage`, so a refresh or the detour through sign-in keeps it.
   - `/booking` shows each tour with a stepper, a line total and Remove, plus the grand total. Nothing is charged until **Proceed to payment**.
   - Signed out, that button reads **Sign in to book** and goes to `/login?next=/booking`, which returns you to the plan afterwards.
   - The plan is cleared once the success page sees the order is `paid`.
1. **Login check.** `requireAuth` (`server/src/middleware/requireAuth.js`) asks better-auth for the session that matches the request's cookie. If there is none, the request stops with `401`. Otherwise it sets `req.user`, so every order belongs to a real user.
2. **Never trust the browser's price.** The client sends only `{ tourId, travelers }` for each tour. `checkout.js`:
   - checks there are 1–10 tours, no tour twice, and 1–10 travelers each,
   - reads every `tour.price` from the database in one query (a missing tour gets `404`),
   - works out the total,
   - saves **one** `pending` order with one `order_items` row per tour, in one transaction,
   - gives Stripe one line item per tour,
   - creates the Stripe session with `metadata.orderId` and returns `session.url`.
   
   If Stripe refuses, the order is deleted again.
3. **The webhook is the only thing that marks an order paid.** Stripe calls `POST /api/stripe/webhook` itself.
   - The route gets the **raw** body, because it's mounted before `express.json()`.
   - `stripe.webhooks.constructEvent` checks Stripe's signature using `STRIPE_WEBHOOK_SECRET`. A forged request gets `400`.
   - On `checkout.session.completed` with `payment_status: 'paid'`, the order goes from `pending` to `paid` and `paid_at` is set.
   - On `checkout.session.expired`, it goes to `expired`.
   - Only `pending` orders are updated, so if Stripe sends the same event twice, nothing changes the second time.
4. **The success page doesn't decide anything.** The success URL alone proves nothing, because anyone can type it in. `CheckoutSuccess` asks `GET /api/orders/:id`, which returns only the signed-in user's own orders. The webhook can arrive a moment after the redirect, so while the order is still `pending` the page asks again every 1.5 s, up to 6 times.

**Test card:** `4242 4242 4242 4242`, any future expiry date, any CVC, any postcode.

---
## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | health check `{ ok: true, time }` |
| GET | `/api/tours?lang=tr` | all active tours in that language (`en` is the default and the fallback) |
| GET | `/api/tours/:slug?lang=tr` | one active tour, or `404` |
| * | `/api/auth/*` | better-auth: `sign-up/email`, `sign-in/email`, `get-session`, `sign-out` |
| POST | `/api/checkout` | 🔒 body `{ lang, items: [{ tourId, travelers }, ...] }` → `{ url }` of one Stripe Checkout page (in that language, in TRY) for all of them |
| GET | `/api/orders/:id?lang=tr` | 🔒 one of *your* orders with its items and line totals (someone else's → `404`) |
| POST | `/api/stripe/webhook` | called by Stripe only. The signature is verified. Marks orders `paid` / `expired`. Events without our `orderId` are acknowledged and ignored |
| * | any other `/api/*` | `404` |

🔒 = needs a signed-in user (`requireAuth`), otherwise `401`.

**Errors** are `{ error, code }`: `error` is an English sentence for logs and API users, and `code` (e.g. `TOO_MANY_TRAVELERS`, `SIGN_IN_REQUIRED`) is what the frontend translates. better-auth errors carry codes too (e.g. `INVALID_EMAIL_OR_PASSWORD`).

