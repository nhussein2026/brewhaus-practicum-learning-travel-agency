import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { signIn, signUp } from '../lib/auth-client'

// One form for both pages: mode is 'signin' or 'signup'.
export function AuthForm({ mode }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // Where to go after signing in, e.g. /login?next=/book/discover-kyoto?travelers=3
  // Only paths on our own site are allowed ('/...' but not '//other-site.com').
  const requested = params.get('next') ?? '/'
  const next = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/'
  const nextQuery = next === '/' ? '' : `?next=${encodeURIComponent(next)}`
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)

    const form = new FormData(e.currentTarget)
    const email = String(form.get('email'))
    const password = String(form.get('password'))
    const name = String(form.get('name') ?? '')

    try {
      // On success the server sets the session cookie; useSession() in the header picks it up.
      const result = isSignup
        ? await signUp.email({ name, email, password })
        : await signIn.email({ email, password })

      if (result.error) {
        setError(result.error.message ?? 'That did not work. Please try again.')
        return
      }

      navigate(next)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto w-[90%] max-w-md py-[58px] sm:py-[82px]">
      <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-brand">
        {isSignup ? 'JOIN WANDERLY' : 'WELCOME BACK'}
      </p>
      <h1 className="text-[1.8rem] leading-[1.2] font-bold text-forest sm:text-4xl">
        {isSignup ? 'Create your account' : 'Sign in to Wanderly'}
      </h1>
      <p className="mt-2 text-muted">
        {isSignup ? 'Takes less than a minute.' : 'Pick up planning where you left off.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {isSignup && <Field label="Name" name="name" type="text" autoComplete="name" required />}
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          minLength={8}
          required
          hint={isSignup ? 'At least 8 characters.' : undefined}
        />

        {error && (
          <p role="alert" className="rounded-[5px] bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full cursor-pointer rounded-[5px] bg-brand px-[22px] py-[13px] font-bold text-white hover:bg-forest disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? 'One moment...' : isSignup ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isSignup ? (
          <>Already have an account? <Link to={`/login${nextQuery}`} className="font-bold text-brand">Sign in</Link></>
        ) : (
          <>New to Wanderly? <Link to={`/signup${nextQuery}`} className="font-bold text-brand">Create an account</Link></>
        )}
      </p>
    </main>
  )
}

function Field({ label, hint, name, ...props }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-bold text-forest">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="mt-1.5 h-11 w-full rounded-[5px] border border-line px-3 outline-none focus:border-brand"
        {...props}
      />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}
