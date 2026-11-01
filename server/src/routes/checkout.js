import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { tours, orders, orderItems } from '../db/schema.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { stripe } from '../lib/stripe.js'

export const checkoutRouter = Router()

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'

// POST /api/checkout  body: { tourId, travelers }
// The browser only says WHICH tour and HOW MANY travelers. The price always comes from our database.
checkoutRouter.post('/', requireAuth, async (req, res) => {
  const tourId = Number(req.body?.tourId)
  const travelers = Number(req.body?.travelers)

  if (!Number.isInteger(travelers) || travelers < 1 || travelers > 10) {
    return res.status(400).json({ error: 'Travelers must be a whole number from 1 to 10.' })
  }

  const [tour] = await db.select().from(tours).where(eq(tours.id, tourId)).limit(1)
  if (!tour) return res.status(404).json({ error: 'No such tour' })

  // 1. Save the order as 'pending', with the price copied from the database.
  const order = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(orders)
      .values({ userId: req.user.id, total: tour.price * travelers })
      .returning()
    await tx.insert(orderItems).values({
      orderId: created.id,
      tourId: tour.id,
      travelers,
      unitPrice: tour.price,
    })
    return created
  })

  // 2. Ask Stripe for a hosted checkout page for that order.
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: req.user.email,
      line_items: [
        {
          quantity: travelers,
          price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100, // Stripe counts in cents
            product_data: {
              name: `${tour.name}, ${tour.days} days`,
              images: [tour.imageUrl],
            },
          },
        },
      ],
      // The webhook reads this to know which order was paid.
      metadata: { orderId: String(order.id) },
      success_url: `${CLIENT_URL}/checkout/success?order=${order.id}`,
      // "Back" on Stripe returns to the review page with the same choices.
      cancel_url: `${CLIENT_URL}/book/${tour.slug}?travelers=${travelers}`,
    })

    await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id))

    // 3. The browser goes to this URL to pay.
    res.json({ url: session.url })
  } catch (err) {
    // Stripe refused, so this order can never be paid. Remove it again.
    await db.delete(orders).where(eq(orders.id, order.id))
    throw err
  }
})
