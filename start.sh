#!/usr/bin/env bash
# Runs the whole Wanderly app locally:
#   - API (Express)            http://localhost:3001
#   - Frontend (Vite + React)  http://localhost:5173
#   - Stripe webhook forwarder (only if the Stripe CLI is installed)
#
# Usage:
#   ./start.sh          install missing packages, then start everything
#   ./start.sh --setup  also create/update the tables and seed the tours first
#
# Press Ctrl+C to stop everything.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
SERVER="$ROOT/server"
CLIENT="$ROOT/client"
API_PORT=3001

# 1. The server can't run without its secrets.
if [ ! -f "$SERVER/.env" ]; then
  echo "server/.env is missing."
  echo "Copy server/.env.example to server/.env and fill in DATABASE_URL, BETTER_AUTH_SECRET and the Stripe keys."
  exit 1
fi

# 2. Install packages the first time (or after a fresh clone).
for dir in "$SERVER" "$CLIENT"; do
  if [ ! -d "$dir/node_modules" ]; then
    echo "Installing packages in ${dir#"$ROOT"/}..."
    (cd "$dir" && npm install)
  fi
done

# 3. Optional: create the tables and seed the tours.
if [ "${1:-}" = "--setup" ]; then
  echo "Removing old tour columns (safe to repeat)..."
  (cd "$SERVER" && npm run db:upgrade)
  echo "Pushing the database schema..."
  (cd "$SERVER" && npm run db:push)
  echo "Seeding tours..."
  (cd "$SERVER" && npm run db:seed)
fi

# 4. Stop every process we started when this script exits (Ctrl+C included).
pids=()
cleanup() {
  echo
  echo "Stopping Wanderly..."
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# 5. Start the API, then wait until it answers before starting the rest.
(cd "$SERVER" && npm run dev) &
pids+=($!)

echo "Waiting for the API on port $API_PORT..."
for _ in $(seq 1 50); do
  if curl -s "http://localhost:$API_PORT/api/health" > /dev/null; then
    break
  fi
  sleep 0.2
done

# 6. Forward Stripe test webhooks to the local API, if the Stripe CLI is installed.
#    The whsec_... it prints must match STRIPE_WEBHOOK_SECRET in server/.env.
if command -v stripe > /dev/null; then
  stripe listen --forward-to "localhost:$API_PORT/api/stripe/webhook" &
  pids+=($!)
else
  echo "Stripe CLI not found: payments will work, but orders stay 'pending' locally."
  echo "Install it from https://docs.stripe.com/stripe-cli and run 'stripe login' once."
fi

# 7. Start the frontend.
(cd "$CLIENT" && npm run dev) &
pids+=($!)

echo
echo "Wanderly is starting: open http://localhost:5173 (API on http://localhost:$API_PORT)"
echo "Press Ctrl+C to stop."
wait
