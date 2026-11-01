import { Router } from 'express'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { orders, orderItems, tours } from '../db/schema.js'
import { requireAuth } from '../middleware/requireAuth.js'

export const ordersRouter = Router()

// GET /api/orders/:id: one of YOUR orders, with what was bought.
ordersRouter.get('/:id', requireAuth, async (req, res) => {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, Number(req.params.id)), eq(orders.userId, req.user.id)))
    .limit(1)
  // Someone else's order also gets 404, so order ids can't be probed.
  if (!order) return res.status(404).json({ error: 'No such order' })

  const items = await db
    .select({
      tourName: tours.name,
      country: tours.country,
      days: tours.days,
      travelers: orderItems.travelers,
      unitPrice: orderItems.unitPrice,
    })
    .from(orderItems)
    .innerJoin(tours, eq(orderItems.tourId, tours.id))
    .where(eq(orderItems.orderId, order.id))

  const { stripeSessionId: _hidden, ...publicOrder } = order
  res.json({ ...publicOrder, items })
})
