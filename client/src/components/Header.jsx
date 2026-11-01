import { Link } from 'react-router'
import { useSession, signOut } from '../lib/auth-client'
import { useTripPlan } from '../lib/trip-plan'
import { Logo } from './Logo'

// "/#tours" (not "#tours") so the links also work from other pages.
const links = [
  { href: '/#tours', label: 'Tours' },
  { href: '/#about', label: 'About' },
  { href: '/#reviews', label: 'Reviews' },
]

export function Header() {
  // useSession asks the API who is signed in (using the session cookie) and re-renders when that changes.
  const { data: session, isPending } = useSession()
  const { plans } = useTripPlan()
  const firstName = session?.user?.name.split(' ')[0]

  return (
    <header id="home" className="border-b border-line bg-white">
      {/* Mobile: logo + trip button on top, links and account below. sm and up: one row. */}
      <nav
        aria-label="Main navigation"
        className="mx-auto flex w-[90%] max-w-[1100px] flex-wrap items-center justify-between gap-x-6 gap-y-3 py-[18px] sm:min-h-[76px] sm:flex-nowrap sm:py-0"
      >
        <Logo />

        {/* 1. Page links */}
        <div className="order-3 flex w-full flex-wrap items-center gap-x-[18px] gap-y-2 text-[0.95rem] sm:order-none sm:ml-auto sm:w-auto sm:gap-[26px]">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-brand">
              {link.label}
            </a>
          ))}

          {/* 2. Account: who is signed in, or a way to sign in */}
          <div className="ml-auto flex items-center gap-3 sm:ml-0 sm:border-l sm:border-line sm:pl-6">
            {isPending ? null : session?.user ? (
              <>
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-mist text-sm font-bold text-brand"
                  >
                    {firstName[0].toUpperCase()}
                  </span>
                  <span className="font-bold text-forest">{firstName}</span>
                </span>
                <button type="button" onClick={() => signOut()} className="cursor-pointer text-sm text-muted hover:text-brand">
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="font-bold text-forest hover:text-brand">
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* 3. The main action: the trip plan, with how many tours are in it */}
        <Link
          to="/booking"
          className="flex items-center gap-2 rounded-[5px] bg-brand px-4 py-2.5 text-[0.95rem] text-white hover:bg-forest"
        >
          My trip
          <span
            aria-label={`${plans.length} ${plans.length === 1 ? 'tour' : 'tours'} in your plan`}
            className="min-w-6 rounded-full bg-white px-1.5 text-center text-sm font-bold text-brand"
          >
            {plans.length}
          </span>
        </Link>
      </nav>
    </header>
  )
}
