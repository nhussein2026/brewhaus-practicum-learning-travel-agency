import { Router } from 'express'
import { eq, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { tours, orders, orderItems } from '../db/schema.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { stripe } from '../lib/stripe.js'

export const checkoutRouter = Router()

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'
const MAX_PLANS = 10

// POST /api/checkout  body: { items: [{ tourId, travelers }, ...] }
// The browser only says WHICH tours and HOW MANY travelers. Prices always come from our database.
checkoutRouter.post('/', requireAuth, async (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : []

  if (items.length === 0 || items.length > MAX_PLANS) {
    return res.status(400).json({ error: `Choose between 1 and ${MAX_PLANS} tours.` })
  }

  const wanted = items.map((item) => ({ tourId: Number(item?.tourId), travelers: Number(item?.travelers) }))

  if (wanted.some((item) => !Number.isInteger(item.travelers) || item.travelers < 1 || item.travelers > 10)) {
    return res.status(400).json({ error: 'Travelers must be a whole number from 1 to 10.' })
  }
  if (new Set(wanted.map((item) => item.tourId)).size !== wanted.length) {
    return res.status(400).json({ error: 'Each tour can only be in your plan once.' })
  }

  // Look up every chosen tour in one query.
  const found = await db.select().from(tours).where(inArray(tours.id, wanted.map((item) => item.tourId)))
  if (found.length !== wanted.length) return res.status(404).json({ error: 'One of those tours no longer exists.' })

  // Pair each choice with its tour row (and its real price).
  const lines = wanted.map((item) => ({ ...item, tour: found.find((tour) => tour.id === item.tourId) }))
  const total = lines.reduce((sum, line) => sum + line.tour.price * line.travelers, 0)

  // 1. Save ONE pending order with one order_items row per plan, prices copied from the database.
  const order = await db.transaction(async (tx) => {
    const [created] = await tx.insert(orders).values({ userId: req.user.id, total }).returning()
    await tx.insert(orderItems).values(
      lines.map((line) => ({
        orderId: created.id,
        tourId: line.tour.id,
        travelers: line.travelers,
        unitPrice: line.tour.price,
      })),
    )
    return created
  })

  // 2. Ask Stripe for ONE hosted checkout page covering every plan.
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: req.user.email,
      line_items: lines.map((line) => ({
        quantity: line.travelers,
        price_data: {
          currency: 'usd',
          unit_amount: line.tour.price * 100, // Stripe counts in cents
          product_data: {
            name: `${line.tour.name}, ${line.tour.days} days`,
            images: [line.tour.imageUrl],
          },
        },
      })),
      // The webhook reads this to know which order was paid.
      metadata: { orderId: String(order.id) },
      success_url: `${CLIENT_URL}/checkout/success?order=${order.id}`,
      // "Back" on Stripe returns to the trip plan page, which still holds the choices.
      cancel_url: `${CLIENT_URL}/booking`,
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
