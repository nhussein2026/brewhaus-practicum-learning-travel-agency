import { Router } from 'express'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { orders, orderItems, tours } from '../db/schema.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { parseId } from '../lib/parse-id.js'
import { pickLocale, loadTranslations } from '../lib/locale.js'
import { lineTotal } from '../lib/pricing.js'

export const ordersRouter = Router()

// GET /api/orders/:id?lang=tr: one of YOUR orders, with what was bought.
ordersRouter.get('/:id', requireAuth, async (req, res) => {
  const locale = pickLocale(req.query.lang)
  const orderId = parseId(req.params.id)
  // Someone else's order also gets 404, so order ids can't be probed.
  const notFound = () => res.status(404).json({ error: 'No such order', code: 'ORDER_NOT_FOUND' })
  if (!orderId) return notFound()

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, req.user.id)))
    .limit(1)
  if (!order) return notFound()

  const rows = await db
    .select({
      tourId: tours.id,
      slug: tours.slug,
      travelers: orderItems.travelers,
      unitPrice: orderItems.unitPrice,
      priceUnit: orderItems.priceUnit,
    })
    .from(orderItems)
    .innerJoin(tours, eq(orderItems.tourId, tours.id))
    .where(eq(orderItems.orderId, order.id))

  const texts = await loadTranslations(db, rows.map((row) => row.tourId), locale)
  const items = rows.map((row) => ({
    ...row,
    // Tours from before the bilingual update have no translation: show their slug instead.
    tourName: texts.get(row.tourId)?.name ?? row.slug,
    duration: texts.get(row.tourId)?.duration ?? '',
    lineTotal: lineTotal(row.unitPrice, row.priceUnit, row.travelers),
  }))

  const { stripeSessionId: _hidden, ...publicOrder } = order
  res.json({ ...publicOrder, items })
})
