import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { signIn, signUp } from '../lib/auth-client'
import { useI18n } from '../lib/i18n'
import { errorMessage } from '../lib/errors'

// One form for both pages: mode is 'signin' or 'signup'.
export function AuthForm({ mode }) {
  const { t } = useI18n()
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const [params] = useSearchParams()
  // Where to go after signing in, e.g. /login?next=/booking
  // Only paths on our own site are allowed ('/...' but not '//other-site.com').
  const requested = params.get('next') ?? '/'
  const next = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/'
  const nextQuery = next === '/' ? '' : `?next=${encodeURIComponent(next)}`
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)
    const email = String(form.get('email')).trim()
    const password = String(form.get('password'))
    // Trim so " Ali" is saved as "Ali". A name of only spaces is refused here.
    const name = String(form.get('name') ?? '').trim()
    if (isSignup && !name) {
      setError(t('auth.nameRequired'))
      return
    }

    setBusy(true)
    try {
      // On success the server sets the session cookie; useSession() in the header picks it up.
      const result = isSignup ? await signUp.email({ name, email, password }) : await signIn.email({ email, password })

      if (result.error) {
        // better-auth sends a code such as INVALID_EMAIL_OR_PASSWORD; we show it in the visitor's language.
        setError(errorMessage(t, result.error.code))
        return
      }

      navigate(next)
    } catch {
      setError(t('errors.network'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="mx-auto w-[90%] max-w-md py-[58px] sm:py-[82px]">
      <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-brand">{t(isSignup ? 'auth.signupEyebrow' : 'auth.signinEyebrow')}</p>
      <h1 className="text-[1.8rem] leading-[1.2] font-bold text-forest sm:text-4xl">{t(isSignup ? 'auth.signupTitle' : 'auth.signinTitle')}</h1>
      <p className="mt-2 text-muted">{t(isSignup ? 'auth.signupText' : 'auth.signinText')}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {isSignup && <Field label={t('auth.name')} name="name" type="text" autoComplete="name" required />}
        <Field label={t('auth.email')} name="email" type="email" autoComplete="email" required />
        <Field
          label={t('auth.password')}
          name="password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          minLength={8}
          required
          hint={isSignup ? t('auth.passwordHint') : undefined}
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
          {busy ? t('auth.busy') : t(isSignup ? 'auth.signupButton' : 'auth.signinButton')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isSignup ? (
          <>
            {t('auth.haveAccount')}{' '}
            <Link to={`/login${nextQuery}`} className="font-bold text-brand">
              {t('auth.signinButton')}
            </Link>
          </>
        ) : (
          <>
            {t('auth.noAccount')}{' '}
            <Link to={`/signup${nextQuery}`} className="font-bold text-brand">
              {t('auth.createAccount')}
            </Link>
          </>
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
