import { Router } from 'express'
import { asc, eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { tours } from '../db/schema.js'

export const toursRouter = Router()

// GET /api/tours: every tour, in the order they were added.
toursRouter.get('/', async (_req, res) => {
  const rows = await db.select().from(tours).orderBy(asc(tours.id))
  res.json(rows)
})

// GET /api/tours/:slug: one tour, or 404.
toursRouter.get('/:slug', async (req, res) => {
  const [row] = await db.select().from(tours).where(eq(tours.slug, req.params.slug)).limit(1)
  if (!row) return res.status(404).json({ error: 'No such tour' })
  res.json(row)
})
