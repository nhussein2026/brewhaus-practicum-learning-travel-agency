import { inArray } from 'drizzle-orm'
import { tourTranslations } from '../db/schema.js'

export const LOCALES = ['en', 'tr']
export const DEFAULT_LOCALE = 'en'

// '?lang=tr' → 'tr'. Anything we don't support falls back to English.
export function pickLocale(value) {
  return LOCALES.includes(value) ? value : DEFAULT_LOCALE
}

// Loads the translations for some tours, in the wanted language with English as the fallback,
// and returns a Map: tourId → translation row.
export async function loadTranslations(db, tourIds, locale) {
  if (tourIds.length === 0) return new Map()
  const rows = await db.select().from(tourTranslations).where(inArray(tourTranslations.tourId, tourIds))

  const byTour = new Map()
  for (const row of rows) {
    const current = byTour.get(row.tourId)
    // Keep the wanted language if we have it, otherwise the default one.
    if (!current || row.locale === locale || (current.locale !== locale && row.locale === DEFAULT_LOCALE)) {
      byTour.set(row.tourId, row)
    }
  }
  return byTour
}
