# Wanderly Travel: BrewHaus Practicum

Wanderly is a website for a travel agency, built during the BrewHaus Practicum. The project grows week by week:

- Week 1 was a static HTML/CSS page.
- Week 2 rebuilt it with React + Tailwind.
- Week 3 added a real backend, a Postgres database, login, and deployment.

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
| Hosting | Vercel (client), Railway (server) | | Both parts are live on public URLs. |
| Linting | oxlint | 1 | `npm run lint` in `client/`. |
| Runtime | Node.js | 20+ (built with 22) | |

Plain JavaScript everywhere (no TypeScript).

---

## Project structure

```
.
├── client/                      React app (deployed to Vercel)
│   ├── index.html               Vite entry (a #root div + script tag)
│   ├── vite.config.js           React + Tailwind plugins, dev proxy /api → http://localhost:3001
│   ├── vercel.json              production: /api/* → Railway, everything else → index.html
│   └── src/
│       ├── main.jsx             mounts <App />
│       ├── App.jsx              router: / (home), /login, /signup
│       ├── index.css            Tailwind import + @theme colours
│       ├── lib/auth-client.js   better-auth client: signIn, signUp, signOut, useSession
│       ├── data/reviews.js      testimonials (still static)
│       └── components/
│           ├── Header.jsx           nav + "Sign in" or "Hi, name · Sign out"
│           ├── AuthForm.jsx         shared sign-in / sign-up form
│           ├── Tours.jsx            fetches /api/tours, region filter
│           ├── TourCard.jsx         one tour + its traveler count
│           ├── TravelerStepper.jsx  controlled − / + component
│           └── Hero, About, Reviews, PlanTrip, Footer, SectionHeading, Logo
│
└── server/                      Express API (deployed to Railway)
    ├── .env.example             template for the secrets (.env itself is git-ignored)
    ├── drizzle.config.js        tells drizzle-kit where the schema and database are
    ├── railway.json             start command + health check for Railway
    └── src/
        ├── index.js             Express app: CORS, auth handler, routes, 404 + error handler
        ├── auth.js              better-auth config (database, email/password, session length)
        ├── routes/tours.js      GET /api/tours, GET /api/tours/:slug
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

- **One user can have many sessions**, for example a laptop and a phone. Deleting a user deletes their sessions and accounts too (`on delete cascade`).
- better-auth owns the first four tables. Our own code only reads `tours`.

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

## Running locally

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
| * | any other `/api/*` | `404 { error: 'No such endpoint' }` |

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
   - `/api/*` is forwarded to Railway. All other paths get `index.html`, so `/login` survives a refresh.

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

### Assignment 4: Stripe payments (Week 4, next)

Stripe Checkout in test mode, an orders table, and a webhook that marks orders as paid.
