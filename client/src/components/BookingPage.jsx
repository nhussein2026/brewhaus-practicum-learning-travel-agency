import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSession } from '../lib/auth-client'
import { useTripPlan } from '../lib/trip-plan'
import { TravelerStepper } from './TravelerStepper'

// /booking: the last step before paying. Shows every tour in the trip plan,
// what each costs and the grand total. Nothing is charged here.
// "Proceed to payment" starts ONE Stripe checkout for all of them.
export function BookingPage() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const { plans, savePlan, removePlan } = useTripPlan()

  const [tours, setTours] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState(null)

  // Load the tours (and their real prices) from our API.
  useEffect(() => {
    async function loadTours() {
      try {
        const response = await fetch('/api/tours')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        setTours(await response.json())
        setStatus('ready')
      } catch (err) {
        console.error('Failed to load tours', err)
        setStatus('error')
      }
    }

    loadTours()
  }, [])

  // Join each plan with its tour. Plans for tours that no longer exist are skipped.
  const lines = plans
    .map((plan) => ({ ...plan, tour: tours.find((tour) => tour.id === plan.tourId) }))
    .filter((line) => line.tour)
  const total = lines.reduce((sum, line) => sum + line.tour.price * line.travelers, 0)
  const travelerCount = lines.reduce((sum, line) => sum + line.travelers, 0)

  async function handlePay() {
    setPaying(true)
    setPayError(null)
    try {
      // Only tour ids and traveler counts are sent. The server works out every price again itself.
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: lines.map((line) => ({ tourId: line.tourId, travelers: line.travelers })) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Checkout failed')

      // Leave our site for Stripe's hosted checkout page.
      window.location.assign(data.url)
    } catch (err) {
      setPayError(err.message)
      setPaying(false)
    }
  }

  return (
    <main className="mx-auto w-[90%] max-w-[1100px] py-[58px] sm:py-[82px]">
      <Link to="/#tours" className="mb-6 inline-block font-bold text-brand">← Keep browsing tours</Link>
      <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-brand">REVIEW YOUR BOOKING</p>
      <h1 className="mb-8 text-[1.8rem] leading-[1.2] font-bold text-forest sm:text-4xl">Your trip plan</h1>

      {status === 'loading' && <p className="text-muted">Loading your trip...</p>}
      {status === 'error' && (
        <p role="alert" className="text-muted">We couldn't load the tours right now. Please try again in a moment.</p>
      )}

      {status === 'ready' && lines.length === 0 && (
        <div className="rounded-lg bg-mist p-6 text-center">
          <p className="mb-4 text-muted">Your trip plan is empty. Add one or more tours to book them together.</p>
          <Link to="/#tours" className="inline-block rounded-[5px] bg-brand px-[22px] py-[13px] font-bold text-white hover:bg-forest">
            Explore our tours
          </Link>
        </div>
      )}

      {status === 'ready' && lines.length > 0 && (
        // Mobile: stacked. md and up: tours on the left, price summary on the right.
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start">
          <ul aria-label="Tours in your plan" className="min-w-0 space-y-4">
            {lines.map((line) => (
              <li key={line.tourId} className="flex flex-col overflow-hidden rounded-lg border border-line bg-white sm:flex-row">
                {/* The text sets the row height; the photo just fills its box. */}
                <div className="relative h-[160px] sm:h-auto sm:w-[180px] sm:shrink-0">
                  <img src={line.tour.imageUrl} alt={line.tour.imageAlt} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 p-[18px]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-bold tracking-[1.5px] text-brand uppercase">{line.tour.country}</p>
                      <h2 className="text-xl font-bold text-forest">{line.tour.name}</h2>
                      <p className="text-sm text-muted">{line.tour.days} days · ${line.tour.price} per traveler</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePlan(line.tourId)}
                      aria-label={`Remove ${line.tour.name} from your plan`}
                      className="cursor-pointer text-sm text-muted hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <TravelerStepper value={line.travelers} onChange={(n) => savePlan(line.tourId, n)} />
                    <strong className="text-forest">${line.tour.price * line.travelers}</strong>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside aria-label="Price summary" className="min-w-0 rounded-lg bg-mist p-[18px] sm:p-6 md:sticky md:top-6">
            <h2 className="mb-4 text-xl font-bold text-forest">Price summary</h2>
            <ul className="space-y-2 text-[0.95rem]">
              {lines.map((line) => (
                <li key={line.tourId} className="flex justify-between gap-3">
                  <span className="min-w-0 text-muted">
                    {line.tour.name} · ${line.tour.price} × {line.travelers}
                  </span>
                  <span>${line.tour.price * line.travelers}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-4">
              <span className="font-bold text-forest">Total to pay</span>
              <span className="text-2xl font-bold text-forest">${total}</span>
            </div>
            <p className="mt-1 text-right text-xs text-muted">
              {lines.length} {lines.length === 1 ? 'tour' : 'tours'} · {travelerCount}{' '}
              {travelerCount === 1 ? 'traveler place' : 'traveler places'} · US dollars
            </p>

            {isPending ? null : session?.user ? (
              <>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={paying}
                  className="mt-6 w-full cursor-pointer rounded-[5px] bg-brand px-[22px] py-[13px] font-bold text-white hover:bg-forest disabled:cursor-wait disabled:opacity-60"
                >
                  {paying ? 'Opening secure payment...' : `Proceed to payment · $${total}`}
                </button>
                <p className="mt-2 text-center text-xs text-muted">
                  You'll pay on Stripe's secure page. Booking as {session.user.email}.
                </p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`/login?next=${encodeURIComponent('/booking')}`)}
                  className="mt-6 w-full cursor-pointer rounded-[5px] bg-brand px-[22px] py-[13px] font-bold text-white hover:bg-forest"
                >
                  Sign in to book
                </button>
                <p className="mt-2 text-center text-xs text-muted">Your trip plan is kept while you sign in.</p>
              </>
            )}

            {payError && (
              <p role="alert" className="mt-3 rounded-[5px] bg-red-50 px-3 py-2 text-sm text-red-700">
                {payError}
              </p>
            )}
          </aside>
        </div>
      )}
    </main>
  )
}
