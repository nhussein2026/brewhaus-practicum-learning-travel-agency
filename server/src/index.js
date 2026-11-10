import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth.js'
import { toursRouter } from './routes/tours.js'
import { checkoutRouter } from './routes/checkout.js'
import { webhookRouter } from './routes/webhook.js'
import { ordersRouter } from './routes/orders.js'

const app = express()
const PORT = Number(process.env.PORT ?? 3001)

// Only our own frontend may call the API with cookies.
app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  }),
)

// better-auth handles every /api/auth/* request (sign-up, sign-in, get-session, sign-out).
// It needs the raw request body, so it is mounted before express.json().
app.all('/api/auth/*splat', toNodeHandler(auth))

// The Stripe webhook also needs the raw body (to check Stripe's signature), so it goes before express.json() too.
app.use('/api/stripe/webhook', webhookRouter)

app.use(express.json())
app.use('/api/tours', toursRouter)
app.use('/api/checkout', checkoutRouter)
app.use('/api/orders', ordersRouter)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// Any other /api path is a JSON 404.
app.use('/api/*splat', (_req, res) => {
  res.status(404).json({ error: 'No such endpoint', code: 'NO_ENDPOINT' })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Something broke on our side.', code: 'SERVER_ERROR' })
})

app.listen(PORT, () => {
  console.log(`Wanderly API listening on http://localhost:${PORT}`)
})
