# Wanderly Travel: BrewHaus Practicum

Wanderly is a website for a travel agency, built during the BrewHaus Practicum. The project grows week by week:

- Week 1 was a static HTML/CSS page.
- Week 2 rebuilt it with React + Tailwind.
- Week 3 added a real backend, a Postgres database, login, and deployment.
- Week 4 added real payments with Stripe Checkout (test mode).

The **Development story** below covers each assignment.

---

## Tech stack

| Part | Tool | Version | What it does here |
|---|---|---|---|
| UI library | [React](https://react.dev) | 19 | Splits the page into components. Handles state with `useState` / `useEffect`. |
| Routing | [React Router](https://reactrouter.com) | 8 | The `/`, `/login` and `/signup` pages. |
| Build tool / dev server | [Vite](https://vite.dev) | 8 | Dev server with instant reload, a `/api` proxy, and the production bundle. |
| Styling | [Tailwind CSS](https://tailwindcss.com) | 4 | Utility classes. Brand colours live in an `@theme` block. |
| API server | [Express](https://expressjs.com) | 5 | JSON API under `/api`. |
| Database | PostgreSQL ([Neon](https://neon.tech)) | 17 | Stores users, sessions and tours. |
| ORM | [Drizzle ORM](https://orm.drizzle.team) + `drizzle-kit` | 0.45 / 0.31 | The schema is written in JavaScript. `drizzle-kit push` creates the tables. |
| DB driver | `postgres` (postgres.js) | 4 | The connection Drizzle uses. |
| Auth | [better-auth](https://www.better-auth.com) | 1.7 | Email + password sign-up and sign-in. Sessions are stored in the database and kept in a cookie. |
| Payments | [Stripe](https://stripe.com) Checkout (`stripe` npm package) | 23 | Hosted payment page in test mode. A signed webhook confirms each payment. |
| Hosting | Vercel (client), Railway (server) | | Both parts are live on public URLs. |
| Linting | oxlint | 1 | `npm run lint` in `client/`. |
| Runtime | Node.js | 20+ (built with 22) | |

Plain JavaScript everywhere (no TypeScript).

---

## Project structure

```
.
├── start.sh                     runs the API, frontend and Stripe forwarder together
├── client/                      React app (deployed to Vercel)
│   ├── index.html               Vite entry (a #root div + script tag)
│   ├── vite.config.js           React + Tailwind plugins, dev proxy /api → http://localhost:3001
│   ├── vercel.json              production: /api/* → Railway, everything else → index.html
│   └── src/
│       ├── main.jsx             mounts <App />
│       ├── App.jsx              router: / (home), /login, /signup, /booking, /checkout/success
│       ├── index.css            Tailwind import + @theme colours
│       ├── lib/auth-client.js   better-auth client: signIn, signUp, signOut, useSession
│       ├── lib/trip-plan.jsx    the trip plan (cart): which tours + how many travelers, shared via context
│       ├── data/reviews.js      testimonials (still static)
│       └── components/
│           ├── Header.jsx           page links · account (Sign in / name + Sign out) · "My trip (N)" button
│           ├── BookingPage.jsx      /booking: review every chosen tour + total, then one payment
│           ├── AuthForm.jsx         shared sign-in / sign-up form
│           ├── Tours.jsx            fetches /api/tours, region filter
│           ├── TourCard.jsx         one tour + its traveler count + "Add to trip plan"
│           ├── TravelerStepper.jsx  controlled − / + component
│           ├── CheckoutSuccess.jsx  after payment: polls /api/orders/:id until it says paid
│           └── Hero, About, Reviews, PlanTrip, Footer, SectionHeading, Logo
│
└── server/                      Express API (deployed to Railway)
    ├── .env.example             template for the secrets (.env itself is git-ignored)
    ├── drizzle.config.js        tells drizzle-kit where the schema and database are
    ├── railway.json             start command + health check for Railway
    └── src/
        ├── index.js             Express app: CORS, auth handler, routes, 404 + error handler
        ├── auth.js              better-auth config (database, email/password, session length)
        ├── middleware/
        │   └── requireAuth.js   blocks the request with 401 unless signed in; sets req.user
        ├── lib/stripe.js        Stripe client (reads STRIPE_SECRET_KEY)
        ├── routes/
        │   ├── tours.js         GET /api/tours, GET /api/tours/:slug
        │   ├── checkout.js      POST /api/checkout: creates the order and the Stripe session
        │   ├── webhook.js       POST /api/stripe/webhook: the only place an order becomes 'paid'
        │   └── orders.js        GET /api/orders/:id: one of your own orders
        └── db/
            ├── schema.js        all tables
            ├── index.js         database connection (reads DATABASE_URL)
            ├── tours.data.js    the six tours (moved here from the Week 2 client)
            └── seed.js          inserts the tours into the database
```

---

## Database schema (in plain English)

| Table | One row is… | Key columns |
|---|---|---|
| `user` | a person who signed up | `id`, `name`, `email` (unique) |
| `account` | how that user logs in. For email + password, it holds the **hashed** password | `user_id` → `user.id`, `provider_id` = `credential`, `password` |
| `session` | one signed-in browser | `token` (stored in the cookie), `expires_at`, `user_id` → `user.id` |
| `verification` | a short-lived code (email verification / password reset). Not used yet | `identifier`, `value`, `expires_at` |
| `tours` | one tour package on the site | `id`, `slug` (unique, e.g. `sunny-santorini`), `name`, `country`, `region`, `days`, `price` (whole USD per traveler), `image_url`, `image_alt` |
| `orders` | one checkout by one user | `id`, `user_id` → `user.id`, `status` (`pending` → `paid`, or `expired`), `total` (whole USD), `stripe_session_id` (unique), `created_at`, `paid_at` |
| `order_items` | what was bought in an order, and at what price | `order_id` → `orders.id`, `tour_id` → `tours.id`, `travelers`, `unit_price` (copied from the tour at purchase time) |

- **One user can have many sessions**, for example a laptop and a phone. Deleting a user deletes their sessions and accounts too (`on delete cascade`).
- **One user has many orders, and one order has many items.** Booking Santorini for 2 and Kyoto for 3 in one checkout makes **one** `orders` row and **two** `order_items` rows.
- `unit_price` is **copied** into `order_items`. If a tour's price changes later, old orders still show what the customer actually paid.
- better-auth owns the four auth tables. Our own code works with `tours`, `orders` and `order_items`.

---

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

## Running locally

### Quick start: `start.sh`
```bash
./start.sh            # installs packages if needed, then starts everything
./start.sh --setup    # also creates/updates the tables and seeds the tours first
```
It needs `server/.env` (see below), and it:
- starts the API on **:3001** and waits until it responds,
- starts `stripe listen --forward-to localhost:3001/api/stripe/webhook`, if the Stripe CLI is installed,
- starts the frontend on **:5173**.

**Ctrl+C** stops all of them.

### Step by step

Requires Node 20+ and a Postgres database. A free Neon project works, or a local Docker container:
```bash
docker run -d --name wanderly-pg -e POSTGRES_USER=wanderly -e POSTGRES_PASSWORD=wanderly \
  -e POSTGRES_DB=wanderly -p 127.0.0.1:5440:5432 postgres:17-alpine
# DATABASE_URL="postgresql://wanderly:wanderly@127.0.0.1:5440/wanderly"
```

```bash
# 1. Backend
cd server
npm install
cp .env.example .env      # fill in DATABASE_URL and BETTER_AUTH_SECRET
npm run db:push           # create the tables from src/db/schema.js
npm run db:seed           # insert the six tours
npm run dev               # http://localhost:3001  (restarts on file changes)

# 2. Frontend (second terminal)
cd client
npm install
npm run dev               # http://localhost:5173  (/api is proxied to :3001)
```

Generate a `BETTER_AUTH_SECRET` with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Scripts

| Where | Command | What it does |
|---|---|---|
| `server/` | `npm run dev` | API with auto-restart (`node --watch`) |
| `server/` | `npm start` | API without auto-restart (used by Railway) |
| `server/` | `npm run db:push` | create or update the tables to match `schema.js` |
| `server/` | `npm run db:seed` | insert the tours. Safe to re-run: existing slugs are skipped |
| `server/` | `npm run db:studio` | browse the database in the browser |
| `client/` | `npm run dev` | Vite dev server |
| `client/` | `npm run build` | production build into `client/dist/` |
| `client/` | `npm run preview` | serve the production build locally |
| `client/` | `npm run lint` | oxlint |

### Environment variables (`server/.env`)

| Variable | Local | Production (Railway) |
|---|---|---|
| `DATABASE_URL` | Neon or Docker connection string | Neon connection string |
| `BETTER_AUTH_SECRET` | long random string | a different long random string |
| `BETTER_AUTH_URL` | `http://localhost:3001` | the Vercel URL |
| `CLIENT_URL` | `http://localhost:5173` | the Vercel URL |
| `PORT` | `3001` | set by Railway |
| `STRIPE_SECRET_KEY` | `sk_test_...` (Stripe Dashboard → Developers → API keys, **Test mode**) | same test key |
| `STRIPE_WEBHOOK_SECRET` | the `whsec_...` printed by `stripe listen` | the signing secret of the Dashboard webhook endpoint |

### Testing the webhook locally (Stripe CLI)
```bash
stripe login                                                  # once
stripe listen --forward-to localhost:3001/api/stripe/webhook  # start.sh runs this for you
# copy the printed whsec_... into STRIPE_WEBHOOK_SECRET, then restart the API
```
Then add one or more tours to your trip plan, open **My trip**, click **Proceed to payment** and pay with `4242 4242 4242 4242`. The terminal shows `Order N paid`, and the success page switches to "paid".

To see the orders in the database:
```bash
cd server && npm run db:studio      # or, with the Docker database:
docker exec wanderly-pg psql -U wanderly -c "select id, user_id, status, total, paid_at from orders order by id"
```

`.env` and `.env.*` are listed in `.gitignore`. Only `.env.example` is committed. To check:
```bash
git check-ignore -v server/.env   # prints the .gitignore rule that excludes it
```

---

## API

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | health check `{ ok: true, time }` |
| GET | `/api/tours` | all tours, as JSON |
| GET | `/api/tours/:slug` | one tour, or `404 { error }` |
| * | `/api/auth/*` | better-auth: `sign-up/email`, `sign-in/email`, `get-session`, `sign-out` |
| POST | `/api/checkout` | 🔒 body `{ items: [{ tourId, travelers }, ...] }` → `{ url }` of one Stripe Checkout page for all of them |
| GET | `/api/orders/:id` | 🔒 one of *your* orders with its items (someone else's → `404`) |
| POST | `/api/stripe/webhook` | called by Stripe only. The signature is verified. Marks orders `paid` / `expired` |
| * | any other `/api/*` | `404 { error: 'No such endpoint' }` |

🔒 = needs a signed-in user (`requireAuth`), otherwise `401 { error: 'Please sign in first.' }`.

---

## Deployment

1. **Neon:** create a project and copy the *pooled* connection string. Run `npm run db:push` and `npm run db:seed` against it once.
2. **Railway (API):**
   - Create a new project from the GitHub repo and set the **root directory** to `server`.
   - Add the environment variables above. `BETTER_AUTH_URL` and `CLIENT_URL` are the Vercel URL. Also set `NODE_ENV=production`.
   - Generate a public domain. Railway uses `server/railway.json` (`npm start`, health check `/api/health`).
3. **Vercel (frontend):**
   - Import the repo with the **root directory** set to `client`.
   - In `client/vercel.json`, replace `YOUR-RAILWAY-APP.up.railway.app` with your Railway domain.
   - `/api/*` is forwarded to Railway. All other paths get `index.html`, so `/login`, `/booking` and `/checkout/success` survive a refresh.
4. **Stripe (production webhook):**
   - In the Stripe Dashboard (Test mode), go to **Developers → Webhooks → Add endpoint**.
   - URL: `https://<your-vercel-app>.vercel.app/api/stripe/webhook`. Events: `checkout.session.completed` and `checkout.session.expired`.
   - Copy its signing secret into Railway as `STRIPE_WEBHOOK_SECRET`, and add `STRIPE_SECRET_KEY` there too.
   - Run `npm run db:push` against Neon once more, so the `orders` and `order_items` tables exist.

---

## Development story

### Assignment 1: Static HTML & CSS site (Week 1)

**Goal:** build a responsive one-page site for a business of our choice. Ours is a travel agency.

- `index.html` was one page with semantic sections: header/nav, hero, tour packages, about, reviews, call to action, footer.
- `style.css`:
  - The brand colours were CSS variables.
  - Flexbox laid out the navbar, the about section and the footer.
  - CSS Grid laid out the tour and review cards.
- The responsive design was **desktop-first**. `max-width` media queries took over at 800px and 600px.
- Accessibility basics: `aria-label`s, `aria-labelledby` on sections, alt text on every image.

**Limitations:** the tour cards were copy-pasted HTML, nothing was interactive, and there was one large stylesheet.

---

### Assignment 2: Rebuild with React & Tailwind (Week 2)

**Goal:** the same site, rebuilt as a React + Tailwind app, plus the first real interactivity.

1. Scaffolded **Vite + React** inside the existing repo.
2. **Tailwind v4.** The old colours moved into an `@theme` block, so for example `--color-brand` became the `text-brand` class.
3. **Data in one file.** The tours moved into `src/data/tours.js`, an array of objects rendered with `.map()`. Each tour also got a new `region` field.
4. **Componentized:** `Header`, `Hero`, `Tours`, `About`, `Reviews`, `PlanTrip`, `Footer`, plus the shared `SectionHeading`, `Logo` and `TourCard`.
5. **Region filter with `useState`:**
   - `const [region, setRegion] = useState('All')` holds the selected region.
   - The visible list is calculated on every render, not stored in state.
6. **Controlled `TravelerStepper`.** It holds no state of its own:
   - `TourCard` owns `travelers` and passes `value` and `onChange`.
   - The stepper calls `onChange(value ± 1)`, kept between 1 and 10.
   - The card's total price (`price × travelers`) updates with it.
7. **Mobile-first responsive classes:** no prefix for phones, then `sm:`, `md:` and `lg:`.
8. The old `style.css` was removed. No horizontal scroll from 320px up to 1440px wide.

---

### Assignment 3: Backend, database, auth, and going live (Week 3)

**Goal:** put a real backend behind the site: Postgres, a JSON API, real login, and both parts live on the internet.

1. **Split into `client/` and `server/`.** The Week 2 app moved into `client/` unchanged. `.gitignore` now excludes `.env` and `.env.*` (but not `.env.example`).
2. **Express 5 server** (`server/src/index.js`) with:
   - CORS limited to our own frontend,
   - `GET /api/health`,
   - a JSON 404 for unknown `/api` paths,
   - a JSON 500 error handler.
   
   It runs on port **3001**, because 3000 was already taken on the development machine.
3. **Postgres schema with Drizzle** (`server/src/db/schema.js`): the four better-auth tables and our `tours` table. `npm run db:push` creates them.
4. **Secrets in `.env`.** `DATABASE_URL` and `BETTER_AUTH_SECRET` are read with `dotenv`. `.env.example` documents them, and `.env` is never committed.
5. **Seed script** (`npm run db:seed`). It copies the six Week 2 tours into the `tours` table. `onConflictDoNothing` on the unique `slug` makes it safe to run again.
6. **Real API:** `GET /api/tours` and `GET /api/tours/:slug` read from Postgres and return JSON.
7. **Real authentication with better-auth:**
   - email + password sign-up and sign-in,
   - hashed passwords,
   - database sessions in an httpOnly cookie that lasts 7 days, so they survive a refresh.
8. **Frontend wired up:**
   - **React Router** pages `/login` and `/signup` share the `AuthForm` component.
   - The `Header` uses `useSession()` to show "Sign in" or "Hi, name · Sign out".
   - `Tours` loads its data with `useEffect` + `fetch('/api/tours')`, with loading and error states. The hardcoded `client/src/data/tours.js` was deleted.
   - The Vite dev proxy forwards `/api` to the server.
9. **Deployment config:**
   - `server/railway.json` sets the start command and a health check.
   - `client/vercel.json` sends `/api` to Railway and every other path to `index.html`.

**Tested locally** in headless Chrome, against the full dev setup:
- the tours load from the database,
- sign-up lands back on the home page signed in,
- the session survives a refresh,
- sign-out works,
- a wrong password shows "Invalid email or password",
- signing in again works,
- `/signup` loads directly.

---

### Assignment 4: Real payments with Stripe Checkout (Week 4)

**Goal:** a real (fake-money) purchase from start to finish:
- click **Book now**,
- pay on Stripe's hosted page,
- a webhook confirms the payment,
- the order is saved as paid,
- a success page shows it.

1. **Two new tables:**
   - `orders`: one per purchase, with `status`, `total`, `stripe_session_id` and `paid_at`.
   - `order_items`: which tour, how many travelers, and the `unit_price` at the moment of purchase.
   
   They were pushed with `drizzle-kit push`.
2. **Stripe in test mode.** The `stripe` package, plus `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `.env` (documented in `.env.example`).
3. **Login middleware** `requireAuth`. It returns `401` unless there is a valid session and sets `req.user`. It protects checkout and order lookup.
4. **`POST /api/checkout`.** It:
   - validates the input,
   - reads the **real price from the database** (a `price` sent by the browser is ignored),
   - creates the `pending` order + item in one transaction,
   - creates the Stripe Checkout Session (amount in cents, `metadata.orderId`, success and cancel URLs),
   - returns its URL.
   
   If Stripe fails, the order is removed.
5. **`POST /api/stripe/webhook`.** It:
   - takes the raw body,
   - verifies Stripe's signature,
   - marks the order `paid` on `checkout.session.completed`, or `expired` on `checkout.session.expired`.
   
   It only updates `pending` orders, so a repeated event changes nothing. **No other code sets `paid`.**
6. **"Book now" button** on every `TourCard`:
   - If you're signed out, it sends you to `/login`.
   - Otherwise it posts `{ tourId, travelers }` (the travelers come from the Week 2 stepper) and redirects to Stripe.
   - Errors are shown on the card.
7. **`GET /api/orders/:id` + `/checkout/success` page.**
   - The endpoint returns only your own orders. Anyone else gets `404`.
   - The page asks the endpoint again every 1.5 s (up to 6 times) while the order is `pending`, then shows the paid order with its items and total.
   - It stops asking if you leave the page.
8. **`start.sh`** runs the API, the frontend and `stripe listen` with one command (`--setup` also pushes the schema and seeds), and Ctrl+C stops them all.
9. **Review before paying, and several tours at once:**
   - "Book now" became **Add to trip plan**. Customers can choose several tours, each with its own number of travelers.
   - A new **`/booking`** page lists every chosen tour (photo, days, price per traveler, stepper, line total, Remove), a price summary and the grand total.
   - Only its **Proceed to payment** button starts checkout, and it pays for **all** tours together: one order, several `order_items`, one Stripe page.
   - Cancelling on Stripe returns to `/booking` with the plan intact.
   - Signing in from there returns to `/booking` (`/login?next=/booking`). Only paths on our own site are accepted for `next`.
10. **Header reorganised** into three groups:
    - page links (Tours, About, Reviews),
    - the account (Sign in, or your initial + first name and a smaller Sign out),
    - one main button, **My trip (N)**, that shows how many tours are in the plan.
    
    On phones, the logo and My trip sit on the top row, with the links and the account below.
11. **Scroll fixes:** a new page starts at the top, and links like `/#tours` land on their section, even when coming from another page.

**Tested locally:**
- Checkout without login gets `401`.
- 50 travelers gets `400`.
- An unknown tour gets `404`.
- A Stripe failure leaves no stray order behind.
- A forged webhook gets `400`.
- A Stripe-signed webhook (made with Stripe's own `generateTestHeaderString` helper) flips the order to `paid`.
- Someone else's order gets `404`.
- An empty plan, a duplicate tour, 0 travelers or a missing tour in a multi-tour checkout each get a clear `400`/`404`.
- In Chrome:
  - Adding Santorini (1) and Kyoto (3) shows **My trip 2**.
  - `/booking` shows $650 + $2340 = **$2990**.
  - Changing travelers and removing a tour update the totals and the header count.
  - Signed out, "Sign in to book" returns to `/booking` after sign-in with the plan intact.
  - A paid two-tour order shows both tours and **$3640** on the success page, and the plan empties.
  - No horizontal scroll at 320px.
- The full Stripe payment (real test key + Stripe CLI + card 4242) is done with the real Stripe account.
