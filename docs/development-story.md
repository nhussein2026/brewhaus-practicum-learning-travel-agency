# Development story

How the project grew, one practicum assignment at a time. Back to the [README](../README.md).

## Assignment 1: Static HTML & CSS site (Week 1)

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

## Assignment 2: Rebuild with React & Tailwind (Week 2)

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

## Assignment 3: Backend, database, auth, and going live (Week 3)

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

## Assignment 4: Real payments with Stripe Checkout (Week 4)

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

---

## After the practicum: a bilingual Black Sea demo

**Goal:** turn Wanderly into a convincing demo of a tour agency in the Black Sea highlands (Rize, Kaçkar, Trabzon), in **English and Turkish**, to show a regional tour agency what a modern site could look like.

1. **Fixed the three bugs from the code review first:**
   - a name starting with a space (`" Ali"`) crashed the header and left a blank page. The name is now trimmed, the header never indexes an empty string, and **error boundaries** show a message instead of a blank page if anything else crashes;
   - non-numeric ids (`/api/orders/abc`, `tourId: "x"`) reached Postgres as `NaN` and became `500`s. `parseId()` now turns them into `400`/`404`;
   - a signed Stripe event without our `orderId` caused a `500`, so Stripe would keep retrying. It is now acknowledged with `200` and ignored.
2. **New product range** like a real highlands agency: 4 day tours, 3 hikes (including a 4-day Kaçkar trek), a private VIP day and 2 airport transfers. Demo prices in Turkish lira.
3. **Bilingual data model:** `tour_translations` (one row per tour per language), plus `category`, `price_unit` (`person` / `vehicle`), `max_guests` and `active` on `tours`. The seed script now **upserts** and **archives** instead of skipping, and `db:upgrade` moves an old database over without `drizzle-kit push` asking rename questions.
4. **Bilingual API:** `?lang=` on tours and orders with English fallback. Checkout opens Stripe in the visitor's language, charges in TRY, and sells vans per vehicle (quantity 1) and group tours per traveler. Every error has a `code` the browser translates.
5. **Bilingual frontend:** a small i18n module (context + `t()` + plural forms via `Intl.PluralRules` + prices via `Intl.NumberFormat`), an EN/TR switch, and language chosen from `?lang=`, the saved choice, or the browser's language. `<html lang>` and the tab title follow along.
6. **A page for every tour** (`/tours/:slug`) with description, highlights, what's included, group size, a booking box and an "Ask on WhatsApp" button. Category filter kept in the URL (`/?category=transfer`), a 404 page, and a photo credits page.
7. **Photos** of the real region from Wikimedia Commons (CC0 / CC BY / CC BY-SA), optimised and served from `client/public/images`, each credited.

### Demo mode

`VITE_DEMO_MODE` is on unless set to `false`. In demo mode:
- a banner on every page says the tours, prices and reviews are samples and payments are test-only;
- the reviews section is labelled "sample" (with demo mode off, it is hidden until real reviews exist: invented reviews must never look real);
- `<meta name="robots" content="noindex, nofollow">` is added to `index.html` at build time, so search engines don't list a sample agency.

**Tested locally** against Postgres with a stubbed Stripe call (34 automated browser checks, headless Chrome):
- English and Turkish home pages, the language switch, `?lang=tr` links, and Turkish browsers getting Turkish automatically;
- prices `₺1,850` (EN) / `₺1.850` (TR);
- category filter;
- tour page in Turkish, with the stepper capped at the group size;
- a van for 5 costs the same as a van for 1;
- booking total ₺7.200 + ₺5.200 = **₺12.400**;
- an old plan with an archived tour is cleaned up;
- sign-up as `" Sara Yılmaz"` shows "Sara" with no crash;
- checkout sends `locale: 'tr'` and `currency: 'try'`;
- a signed webhook marks the order paid, the success page shows the van line, and the plan empties;
- the credits page lists all 12 photos, and the 404 page works;
- no horizontal scroll at 320px; no JavaScript errors.

Also checked: all checkout validation codes, archived tours can't be booked, someone else's order gets `404`, and `db:upgrade` → `db:push` → `db:seed` on a Week 4 database (twice) needs no answers and loses no orders.
