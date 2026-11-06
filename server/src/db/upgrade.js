import { sql } from 'drizzle-orm'
import { db } from './index.js'

// One-time upgrade for databases created before the Black Sea demo (Week 2–4 schema).
//
// The old `tours` table had name/country/region/days/image_alt. Those words now live in
// tour_translations. If we let `drizzle-kit push` remove and add columns in one go, it stops
// to ask "was column X renamed to Y?" for every new column. Removing the old columns first
// means the push afterwards only ADDS things, so it asks nothing.
//
// Safe to run more than once (IF EXISTS). Old orders keep working: their tours stay in the
// table (archived by the seed script), they just lose the old English name.
//
// Order: npm run db:upgrade → npm run db:push → npm run db:seed
const OLD_COLUMNS = ['name', 'country', 'region', 'days', 'image_alt']

async function upgrade() {
  // Ask Postgres which of the old columns are still there, so a second run does nothing (and prints no warnings).
  const rows = await db.execute(sql`
    select column_name from information_schema.columns
    where table_name = 'tours' and column_name in ${OLD_COLUMNS}
  `)
  const found = rows.map((row) => row.column_name)

  if (found.length === 0) {
    console.log('Nothing to upgrade: the tours table is already in the new shape.')
  } else {
    for (const column of found) {
      await db.execute(sql`alter table tours drop column ${sql.identifier(column)}`)
    }
    console.log(`Removed old tour columns: ${found.join(', ')}.`)
  }
  console.log('Next: npm run db:push && npm run db:seed')
  process.exit(0)
}

upgrade().catch((err) => {
  console.error(err)
  process.exit(1)
})
