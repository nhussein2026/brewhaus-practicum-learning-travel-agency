<!-- readme-standard: 1.1 -->
# Wanderly Travel

## Overview

Wanderly is a full-stack booking site for a tour agency in Turkey's Black Sea highlands (Rize, Kaçkar, Trabzon), in English and Turkish. Visitors browse tours and airport transfers, put several of them in a trip plan, sign in, and pay for all of them at once with Stripe Checkout. A signed Stripe webhook is the only thing that marks an order as paid.

> **This is a demo.** A banner on every page says the tours, prices and reviews are samples. Payments run in Stripe test mode, and search engines are asked not to index the site.

## Project Journey

I built Wanderly during the BrewHaus Practicum between October and November 2026, one assignment a week: a static HTML/CSS page, then a React and Tailwind rebuild, then a Postgres backend with sign-in, then Stripe payments. In November 2026 I turned it into a bilingual demo of a Black Sea tour agency, to show a regional agency what a modern site could look like.

- **Role:** Sole developer
- **Team:** Solo
- **Dates:** Oct 2026 – Nov 2026
- **AI use:** The bilingual demo (November 2026) was written with Claude Code; I directed, reviewed and tested it.

## Project Status

**Completed.** The practicum work and the bilingual demo are finished and run locally. The site is not deployed yet.

## Technologies

| Category | Used |
| --- | --- |
| Languages | JavaScript (no TypeScript), HTML, CSS |
| Frameworks and Libraries | React 19, React Router 8, Tailwind CSS 4, Express 5, better-auth 1.7, Stripe (`stripe` 23) |
| Databases | PostgreSQL 17 (Neon or Docker), Drizzle ORM 0.45 and drizzle-kit 0.31, postgres.js 4 |
| Infrastructure and DevOps | Vercel (frontend) and Railway (API) configs, Stripe CLI for local webhooks |
| Development Tools | Vite 8, oxlint, Node.js 20+ |

## How to Run

Prerequisites: Node.js 20 or newer and a PostgreSQL database. A free Neon project works, or a local Docker container:

```bash
docker run -d --name wanderly-pg -e POSTGRES_USER=wanderly -e POSTGRES_PASSWORD=wanderly \
  -e POSTGRES_DB=wanderly -p 127.0.0.1:5440:5432 postgres:17-alpine
```

```bash
git clone https://github.com/nhussein2026/brewhaus-practicum-learning-travel-agency.git
cd brewhaus-practicum-learning-travel-agency
cp server/.env.example server/.env   # then fill in the values
./start.sh --setup                   # install, create the tables, seed the tours, start everything
```

`start.sh` starts the API on http://localhost:3001, the site on http://localhost:5173 and, if the Stripe CLI is installed, `stripe listen` for the webhook. Ctrl+C stops all of them. Without `--setup` it skips the database step.

Configuration (`server/.env`): `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CLIENT_URL`, `PORT`, `STRIPE_SECRET_KEY` (test mode) and `STRIPE_WEBHOOK_SECRET`. The frontend has three optional settings: `VITE_DEMO_MODE`, `VITE_WHATSAPP_NUMBER` and `VITE_CONTACT_EMAIL`.

Pay with the Stripe test card `4242 4242 4242 4242`, any future date and any CVC. Lint the frontend with `npm run lint` in `client/`.

The step-by-step setup, every script and setting, and deployment are in [docs/running-and-deployment.md](docs/running-and-deployment.md).

## Project Structure

```text
.
├── start.sh            runs the API, the frontend and the Stripe forwarder together
├── client/             React app (Vite, Tailwind), meant for Vercel
│   ├── public/images/  tour and page photos from Wikimedia Commons
│   └── src/
│       ├── components/ pages and parts: tours, tour page, booking, checkout success, sign-in, credits
│       ├── i18n/       every sentence of the site in English and Turkish
│       └── lib/        language context, trip plan (cart), auth client, pricing, settings
├── server/             Express API, meant for Railway
│   └── src/
│       ├── routes/     tours, checkout, orders, Stripe webhook
│       ├── db/         Drizzle schema, the 10 tours in both languages, seed and upgrade scripts
│       ├── middleware/ requireAuth
│       └── lib/        Stripe client, pricing rule, language fallback, id parsing
└── docs/               architecture, running and deployment, development story
```

## Learning

### Objectives
- Build the same site three times over (static HTML/CSS, React, full stack) and see what each layer adds.
- Connect a React frontend to my own API and a real database.
- Add real sign-in and real (test-mode) payments without trusting the browser.
- Get a two-part app ready to deploy on Vercel and Railway.

### Key Concepts
- **Responsive layout**: desktop-first media queries in Week 1, then mobile-first Tailwind classes (`sm:`, `md:`, `lg:`).
- **React state and context**: the region filter and controlled `TravelerStepper`, and the trip plan shared through context and saved in `localStorage` (`client/src/lib/trip-plan.jsx`).
- **REST API with Express**: JSON routes, a 404 and error handler, and error codes the frontend translates (`server/src/index.js`, `server/src/routes/`).
- **Relational schema with an ORM**: users, orders and order items, translations in their own table, and archiving tours instead of deleting them (`server/src/db/schema.js`).
- **Session authentication**: better-auth with hashed passwords and a database session in an httpOnly cookie, and `requireAuth` for protected routes.
- **Payments with webhooks**: the price comes from the database, never from the browser, and a signature-checked webhook marks orders paid. It only changes `pending` orders, so a repeated event does nothing (`server/src/routes/checkout.js`, `webhook.js`).
- **Internationalisation**: a small `t()` context with `Intl.PluralRules` and `Intl.NumberFormat`, and an English fallback in the API (`client/src/lib/i18n.jsx`, `server/src/lib/locale.js`).

### What I Learned
- Moving from a static page to components and data files makes changes cheaper: the tours went from copied HTML to one array, and later to a database table, without rewriting the cards.
- Payment state must be decided on the server. The success page proves nothing on its own; only the verified webhook does.
- Copying the price into each order item keeps old orders correct when prices change.
- Keeping `/api` on the same origin (Vite proxy in development, a Vercel rewrite in production) avoids cookie and CORS problems with sign-in.
- Checking outside input carefully (ids, names with spaces, unknown Stripe events) turns crashes and 500 errors into clear 400 and 404 responses.

## Limitations

**Missing features**
- Not deployed yet. `client/vercel.json` still has the `YOUR-RAILWAY-APP` placeholder.
- No email verification or password reset. The `verification` table exists but is not used.
- Tours, prices and reviews are samples, and payments are test mode only.

**Technical limitations**
- No automated test suite in the repository. The checks described in the development story were run locally by hand and with headless Chrome scripts that are not committed.

## Additional Documentation

- [Architecture](docs/architecture.md): database schema, how sign-in works, how payments work, the API.
- [Running and deployment](docs/running-and-deployment.md): scripts, environment variables, testing the webhook locally, deploying to Neon, Railway, Vercel and Stripe.
- [Development story](docs/development-story.md): what each practicum assignment added, and the bilingual demo.

## Credits

- Built for the BrewHaus Practicum (October to November 2026).
- Photos from Wikimedia Commons under CC0, CC BY and CC BY-SA. Each photographer and licence is listed on the site's `/credits` page.

## License

No licence: all rights reserved. © 2026 Nasser Hussein.
