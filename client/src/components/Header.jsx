import { Link } from 'react-router'
import { useSession, signOut } from '../lib/auth-client'
import { useTripPlan } from '../lib/trip-plan'
import { useI18n } from '../lib/i18n'
import { DEMO_MODE } from '../lib/config'
import { Logo } from './Logo'
import { LanguageSwitcher } from './LanguageSwitcher'

// "/#tours" (not "#tours") so the links also work from other pages.
// The reviews are demo samples, so their link only shows in demo mode (like the section itself).
const links = [
  { href: '/#tours', key: 'nav.tours' },
  { href: '/#about', key: 'nav.about' },
  ...(DEMO_MODE ? [{ href: '/#reviews', key: 'nav.reviews' }] : []),
  { href: '/#plan', key: 'nav.contact' },
]

export function Header() {
  const { t } = useI18n()
  // useSession asks the API who is signed in (using the session cookie) and re-renders when that changes.
  const { data: session, isPending } = useSession()
  const { plans } = useTripPlan()
  // trim() + split on any run of spaces, so " Ali" gives "Ali" (not ""). Fall back to the email if the name is blank.
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || session?.user?.email || '?'

  return (
    <header id="home" className="border-b border-line bg-white">
      {/* Mobile: logo + trip button on top, links, account and language below. md and up: one row. */}
      <nav
        aria-label={t('nav.label')}
        className="mx-auto flex w-[90%] max-w-[1100px] flex-wrap items-center justify-between gap-x-6 gap-y-3 py-[18px] md:min-h-[76px] md:flex-nowrap md:py-0"
      >
        <Logo />

        {/* 1. Page links */}
        <div className="order-3 flex w-full flex-wrap items-center gap-x-[18px] gap-y-2 text-[0.95rem] md:order-none md:ml-auto md:w-auto md:gap-[22px]">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-brand">
              {t(link.key)}
            </a>
          ))}

          {/* 2. Language + account */}
          <div className="ml-auto flex items-center gap-3 md:ml-0 md:border-l md:border-line md:pl-5">
            <LanguageSwitcher />
            {isPending ? null : session?.user ? (
              <>
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-mist text-sm font-bold text-brand"
                  >
                    {firstName[0].toUpperCase()}
                  </span>
                  <span className="max-w-[9rem] truncate font-bold text-forest">{firstName}</span>
                </span>
                <button type="button" onClick={() => signOut()} className="cursor-pointer text-sm text-muted hover:text-brand">
                  {t('nav.signOut')}
                </button>
              </>
            ) : (
              <Link to="/login" className="font-bold text-forest hover:text-brand">
                {t('nav.signIn')}
              </Link>
            )}
          </div>
        </div>

        {/* 3. The main action: the trip plan, with how many tours are in it */}
        <Link
          to="/booking"
          className="flex items-center gap-2 rounded-[5px] bg-brand px-4 py-2.5 text-[0.95rem] whitespace-nowrap text-white hover:bg-forest"
        >
          {t('nav.myTrip')}
          <span
            aria-label={t('nav.toursInPlan', { count: plans.length })}
            className="min-w-6 rounded-full bg-white px-1.5 text-center text-sm font-bold text-brand"
          >
            {plans.length}
          </span>
        </Link>
      </nav>
    </header>
  )
}
