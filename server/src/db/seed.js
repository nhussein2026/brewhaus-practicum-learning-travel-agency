import { db } from './index.js'
import { tours } from './schema.js'
import { toursData } from './tours.data.js'

// Copies the Week 2 tour list into the database.
// Safe to run more than once: tours whose slug already exists are skipped.
async function seed() {
  console.log('Seeding tours...')

  const inserted = await db
    .insert(tours)
    .values(toursData)
    .onConflictDoNothing({ target: tours.slug })
    .returning()

  console.log(`Done: ${inserted.length} new, ${toursData.length - inserted.length} already there.`)
  process.exit(0)
}

seed()
