import { Router } from 'express'
import { and, asc, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { tours } from '../db/schema.js'
import { pickLocale, loadTranslations } from '../lib/locale.js'

export const toursRouter = Router()

// Joins a tour row with its words in one language into the shape the frontend uses.
export function toPublicTour(tour, text) {
  return {
    id: tour.id,
    slug: tour.slug,
    category: tour.category,
    price: tour.price,
    priceUnit: tour.priceUnit,
    maxGuests: tour.maxGuests,
    imageUrl: tour.imageUrl,
    imageCredit: tour.imageAuthor
      ? { author: tour.imageAuthor, license: tour.imageLicense, licenseUrl: tour.imageLicenseUrl, sourceUrl: tour.imageSourceUrl }
      : null,
    locale: text?.locale ?? null,
    name: text?.name ?? tour.slug,
    summary: text?.summary ?? '',
    duration: text?.duration ?? '',
    description: text?.description ?? '',
    highlights: text?.highlights ?? [],
    included: text?.included ?? [],
    imageAlt: text?.imageAlt ?? '',
  }
}

// GET /api/tours?lang=tr: every active tour, in the chosen language (English if missing).
toursRouter.get('/', async (req, res) => {
  const locale = pickLocale(req.query.lang)
  const rows = await db.select().from(tours).where(eq(tours.active, true)).orderBy(asc(tours.sortOrder), asc(tours.id))
  const texts = await loadTranslations(db, rows.map((tour) => tour.id), locale)
  res.json(rows.map((tour) => toPublicTour(tour, texts.get(tour.id))))
})

// GET /api/tours/:slug?lang=tr: one active tour, or 404.
toursRouter.get('/:slug', async (req, res) => {
  const locale = pickLocale(req.query.lang)
  const [tour] = await db
    .select()
    .from(tours)
    .where(and(eq(tours.slug, req.params.slug), eq(tours.active, true)))
    .limit(1)
  if (!tour) return res.status(404).json({ error: 'No such tour', code: 'TOUR_NOT_FOUND' })

  const texts = await loadTranslations(db, [tour.id], locale)
  res.json(toPublicTour(tour, texts.get(tour.id)))
})
