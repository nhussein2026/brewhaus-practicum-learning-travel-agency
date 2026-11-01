import 'dotenv/config'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing. Add your Stripe test key (sk_test_...) to .env.')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
