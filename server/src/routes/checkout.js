import { Router } from 'express'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '../db/index.js'
import { tours, orders, orderItems } from '../db/schema.js'
import { requireAuth } from '../middleware/requireAuth.js'
import { stripe } from '../lib/stripe.js'
import { parseId } from '../lib/parse-id.js'
import { pickLocale, loadTranslations } from '../lib/locale.js'
import { CURRENCY, lineTotal } from '../lib/pricing.js'

export const checkoutRouter = Router()

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173'
const MAX_PLANS = 10

// Each error has an English message (for logs and API users) and a stable `code` the frontend translates.
const fail = (res, status, code, error) => res.status(status).json({ error, code })

// Small server-side words for the Stripe page, which we can't translate in the browser.
const stripeWords = {
  en: { vehicle: (n) => `private vehicle · ${n} ${n === 1 ? 'guest' : 'guests'}` },
  tr: { vehicle: (n) => `özel araç · ${n} kişi` },
}

// POST /api/checkout  body: { items: [{ tourId, travelers }, ...], lang: 'en' | 'tr' }
// The browser only says WHICH tours and HOW MANY travelers. Prices always come from our database.
checkoutRouter.post('/', requireAuth, async (req, res) => {
  const locale = pickLocale(req.body?.lang)
  const items = Array.isArray(req.body?.items) ? req.body.items : []

  if (items.length === 0 || items.length > MAX_PLANS) {
    return fail(res, 400, 'PLAN_SIZE', `Choose between 1 and ${MAX_PLANS} tours.`)
  }

  const wanted = items.map((item) => ({ tourId: parseId(item?.tourId), travelers: Number(item?.travelers) }))

  if (wanted.some((item) => item.tourId === null)) {
    return fail(res, 400, 'INVALID_TOUR', 'Every tour needs a valid tourId.')
  }
  if (wanted.some((item) => !Number.isInteger(item.travelers) || item.travelers < 1)) {
    return fail(res, 400, 'INVALID_TRAVELERS', 'Travelers must be a whole number of at least 1.')
  }
  if (new Set(wanted.map((item) => item.tourId)).size !== wanted.length) {
    return fail(res, 400, 'DUPLICATE_TOUR', 'Each tour can only be in your plan once.')
  }

  // Look up every chosen tour in one query. Archived tours can't be booked.
  const ids = wanted.map((item) => item.tourId)
  const found = await db.select().from(tours).where(and(inArray(tours.id, ids), eq(tours.active, true)))
  if (found.length !== wanted.length) {
    return fail(res, 404, 'TOUR_UNAVAILABLE', 'One of those tours is no longer available.')
  }

  // Pair each choice with its tour row (real price, price unit, group size limit).
  const lines = wanted.map((item) => ({ ...item, tour: found.find((tour) => tour.id === item.tourId) }))
  if (lines.some((line) => line.travelers > line.tour.maxGuests)) {
    return fail(res, 400, 'TOO_MANY_TRAVELERS', 'One of the tours has more travelers than its group size allows.')
  }

  const total = lines.reduce((sum, line) => sum + lineTotal(line.tour.price, line.tour.priceUnit, line.travelers), 0)
  const texts = await loadTranslations(db, ids, locale)

  // 1. Save ONE pending order with one order_items row per tour, prices copied from the database.
  const order = await db.transaction(async (tx) => {
    const [created] = await tx.insert(orders).values({ userId: req.user.id, total, currency: CURRENCY }).returning()
    await tx.insert(orderItems).values(
      lines.map((line) => ({
        orderId: created.id,
        tourId: line.tour.id,
        travelers: line.travelers,
        unitPrice: line.tour.price,
        priceUnit: line.tour.priceUnit,
      })),
    )
    return created
  })

  // 2. Ask Stripe for ONE hosted checkout page covering every tour, in the visitor's language.
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale,
      customer_email: req.user.email,
      line_items: lines.map((line) => {
        const text = texts.get(line.tour.id)
        const perVehicle = line.tour.priceUnit === 'vehicle'
        const name = perVehicle
          ? `${text?.name ?? line.tour.slug} (${stripeWords[locale].vehicle(line.travelers)})`
          : text?.name ?? line.tour.slug
        // Stripe can only show photos it can download, so only send full https:// URLs.
        const imageUrl = line.tour.imageUrl.startsWith('/') ? `${CLIENT_URL}${line.tour.imageUrl}` : line.tour.imageUrl
        return {
          // A van is bought once; a group tour is bought once per traveler.
          quantity: perVehicle ? 1 : line.travelers,
          price_data: {
            currency: CURRENCY,
            unit_amount: line.tour.price * 100, // Stripe counts in the smallest unit (kuruş)
            product_data: {
              name,
              description: text?.duration || undefined,
              images: imageUrl.startsWith('https://') ? [imageUrl] : [],
            },
          },
        }
      }),
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
