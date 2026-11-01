import express, { Router } from 'express'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { orders } from '../db/schema.js'
import { stripe } from '../lib/stripe.js'

export const webhookRouter = Router()

// POST /api/stripe/webhook: Stripe calls this, not the browser.
// It is the ONLY place an order becomes 'paid'.
// express.raw keeps the body as exact bytes: the signature check needs it unparsed.
webhookRouter.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  let event
  try {
    // Proves the request really came from Stripe (signed with our webhook secret).
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET,
    )
  } catch (err) {
    console.warn('Rejected webhook:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  const session = event.data.object
  const orderId = Number(session.metadata?.orderId)

  if (event.type === 'checkout.session.completed' && session.payment_status === 'paid') {
    // Only pending orders can become paid, so a repeated event changes nothing.
    await db
      .update(orders)
      .set({ status: 'paid', paidAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.status, 'pending')))
    console.log(`Order ${orderId} paid`)
  }

  if (event.type === 'checkout.session.expired') {
    await db
      .update(orders)
      .set({ status: 'expired' })
      .where(and(eq(orders.id, orderId), eq(orders.status, 'pending')))
  }

  // Tell Stripe we got it (otherwise it retries).
  res.json({ received: true })
})
