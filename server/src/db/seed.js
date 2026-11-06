import { notInArray, sql } from 'drizzle-orm'
import { db } from './index.js'
import { tours, tourTranslations } from './schema.js'
import { toursData } from './tours.data.js'

const LOCALES = ['en', 'tr']

// Puts the tours from tours.data.js into the database. Safe to run again and again:
// - a tour whose slug already exists is UPDATED (an "upsert"), so text and price edits in the file reach the database;
// - tours that are no longer in the file are ARCHIVED (active = false), not deleted, because old orders point at them.
// Note: once there is an admin panel, the database becomes the source of truth and this script should stop overwriting.
async function seed() {
  console.log('Seeding tours...')
  const slugs = toursData.map((tour) => tour.slug)

  await db.transaction(async (tx) => {
    for (const [index, { en, tr, ...tour }] of toursData.entries()) {
      const values = { ...tour, sortOrder: index, active: true }
      const { slug: _slug, ...changes } = values

      const [row] = await tx
        .insert(tours)
        .values(values)
        .onConflictDoUpdate({ target: tours.slug, set: changes })
        .returning({ id: tours.id })

      const texts = { en, tr }
      for (const locale of LOCALES) {
        const translation = { tourId: row.id, locale, ...texts[locale] }
        await tx
          .insert(tourTranslations)
          .values(translation)
          .onConflictDoUpdate({ target: [tourTranslations.tourId, tourTranslations.locale], set: texts[locale] })
      }
    }

    // Archive everything that isn't in the list any more (e.g. the Week 2 world tours).
    await tx.update(tours).set({ active: false }).where(notInArray(tours.slug, slugs))
  })

  const [{ active, archived }] = await db
    .select({
      active: sql`count(*) filter (where ${tours.active})`.mapWith(Number),
      archived: sql`count(*) filter (where not ${tours.active})`.mapWith(Number),
    })
    .from(tours)
  console.log(`Done: ${active} active tours (${LOCALES.join(' + ')}), ${archived} archived.`)
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
