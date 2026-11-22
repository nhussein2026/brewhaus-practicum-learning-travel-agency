# Running and deployment

Scripts, settings, local Stripe testing and deployment. The quick start is in the [README](../README.md#how-to-run).

## Scripts

| Where | Command | What it does |
|---|---|---|
| `server/` | `npm run dev` | API with auto-restart (`node --watch`) |
| `server/` | `npm start` | API without auto-restart (used by Railway) |
| `server/` | `npm run db:push` | create or update the tables to match `schema.js` |
| `server/` | `npm run db:seed` | insert or update the tours and their translations, archive tours no longer listed. Safe to re-run |
| `server/` | `npm run db:upgrade` | one-time: remove the old Week 2–4 tour columns so `db:push` asks no questions. Safe to re-run |
| `server/` | `npm run db:studio` | browse the database in the browser |
| `client/` | `npm run dev` | Vite dev server |
| `client/` | `npm run build` | production build into `client/dist/` |
| `client/` | `npm run preview` | serve the production build locally |
| `client/` | `npm run lint` | oxlint |

## Environment variables (`server/.env`)

| Variable | Local | Production (Railway) |
|---|---|---|
| `DATABASE_URL` | Neon or Docker connection string | Neon connection string |
| `BETTER_AUTH_SECRET` | long random string | a different long random string |
| `BETTER_AUTH_URL` | `http://localhost:3001` | the Vercel URL |
| `CLIENT_URL` | `http://localhost:5173` | the Vercel URL |
| `PORT` | `3001` | set by Railway |
| `STRIPE_SECRET_KEY` | `sk_test_...` (Stripe Dashboard → Developers → API keys, **Test mode**) | same test key |
| `STRIPE_WEBHOOK_SECRET` | the `whsec_...` printed by `stripe listen` | the signing secret of the Dashboard webhook endpoint |

## Frontend settings (`client/.env.local`, or Vercel → Project → Environment Variables)

All optional. Vite only exposes variables starting with `VITE_`, and they are baked in at **build** time.

| Variable | Default | What it does |
|---|---|---|
| `VITE_DEMO_MODE` | on | `false` removes the demo banner, hides the sample reviews and allows search engines to index the site. Only for a real business with real content. |
| `VITE_WHATSAPP_NUMBER` | none | International format, e.g. `905551234567`. Shows "Ask on WhatsApp" buttons with the tour name already typed. Hidden when not set. |
| `VITE_CONTACT_EMAIL` | `hello@wanderly.example` | Address for the "Email us" button. |

## Testing the webhook locally (Stripe CLI)
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
5. **Database update for the bilingual demo:** against Neon, run `npm run db:upgrade`, `npm run db:push`, `npm run db:seed`, in that order.
6. **Optional:** set `VITE_WHATSAPP_NUMBER` in Vercel, then redeploy (Vite bakes it in at build time).

