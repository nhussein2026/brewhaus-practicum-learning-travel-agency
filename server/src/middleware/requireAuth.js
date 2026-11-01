import { fromNodeHeaders } from 'better-auth/node'
import { auth } from '../auth.js'

// Put this in front of any route that needs a signed-in user.
// It reads the session cookie, looks the session up in the database,
// and either attaches the user to req.user or stops the request with 401.
export async function requireAuth(req, res, next) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) })

  if (!session) {
    return res.status(401).json({ error: 'Please sign in first.' })
  }

  req.user = session.user
  next()
}
