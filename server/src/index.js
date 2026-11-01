import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = Number(process.env.PORT ?? 3000)

// Only our own frontend may call the API with cookies.
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  }),
)

app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// Any other /api path is a JSON 404.
app.use('/api/*splat', (_req, res) => {
  res.status(404).json({ error: 'No such endpoint' })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Something broke on our side.' })
})

app.listen(PORT, () => {
  console.log(`Wanderly API listening on http://localhost:${PORT}`)
})
