import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { useSession } from '../lib/auth-client'
import { TravelerStepper } from './TravelerStepper'

// /book/:slug?travelers=3
// The last step before paying: shows what the customer chose and what it costs.
// Nothing is charged here. "Proceed to payment" is what starts the Stripe checkout.
export function BookingPage() {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()

  const [tour, setTour] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState(null)

  // The traveler count lives in the URL, so a refresh or a detour through sign-in keeps it.
  const travelers = Math.min(10, Math.max(1, Number(params.get('travelers')) || 1))
  const setTravelers = (n) => setParams({ travelers: String(n) }, { replace: true })

  // Load the tour (and its real price) from our API.
  useEffect(() => {
    async function loadTour() {
      try {
        const response = await fetch(`/api/tours/${slug}`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        setTour(await response.json())
        setStatus('ready')
      } catch (err) {
        console.error('Failed to load tour', err)
        setStatus('error')
      }
    }

    loadTour()
  }, [slug])

  async function handlePay() {
    setPaying(true)
    setPayError(null)
    try {
      // Only the tour id and traveler count are sent. The server works out the price again itself.
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId: tour.id, travelers }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Checkout failed')

      // Leave our site for Stripe's hosted checkout page.
      window.location.href = data.url
    } catch (err) {
      setPayError(err.message)
      setPaying(false)
    }
  }

  if (status === 'loading') {
    return <main className="mx-auto w-[90%] max-w-[1100px] py-[58px] text-muted">Loading your trip...</main>
  }

  if (status === 'error') {
    return (
      <main className="mx-auto w-[90%] max-w-[1100px] py-[58px]">
        <h1 className="mb-3 text-[1.8rem] font-bold text-forest">We couldn't find that tour.</h1>
        <Link to="/#tours" className="font-bold text-brand">← Back to all tours</Link>
      </main>
    )
  }

  const total = tour.price * travelers
  const backToHere = `/book/${slug}?travelers=${travelers}`

  return (
    <main className="mx-auto w-[90%] max-w-[1100px] py-[58px] sm:py-[82px]">
      <Link to="/#tours" className="mb-6 inline-block font-bold text-brand">← Back to all tours</Link>
      <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-brand">REVIEW YOUR BOOKING</p>
      <h1 className="mb-8 text-[1.8rem] leading-[1.2] font-bold text-forest sm:text-4xl">Your trip plan</h1>

      {/* Mobile: stacked. md and up: trip details left, price summary right. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start">
        <section aria-label="Trip details" className="min-w-0 overflow-hidden rounded-lg border border-line bg-white">
          <img src={tour.imageUrl} alt={tour.imageAlt} className="h-[220px] w-full object-cover sm:h-[300px]" />
          <div className="p-[18px] sm:p-6">
            <p className="mb-1 text-xs font-bold tracking-[1.5px] text-brand uppercase">{tour.country} · {tour.region}</p>
            <h2 className="mb-4 text-2xl font-bold text-forest">{tour.name}</h2>
            <dl className="grid grid-cols-2 gap-4 text-[0.95rem]">
              <div>
                <dt className="text-muted">Duration</dt>
                <dd className="font-bold text-forest">{tour.days} days</dd>
              </div>
              <div>
                <dt className="text-muted">Price per traveler</dt>
                <dd className="font-bold text-forest">${tour.price}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <span className="font-bold text-forest">Travelers</span>
              <TravelerStepper value={travelers} onChange={setTravelers} />
            </div>
          </div>
        </section>

        <aside aria-label="Price summary" className="min-w-0 rounded-lg bg-mist p-[18px] sm:p-6 md:sticky md:top-6">
          <h2 className="mb-4 text-xl font-bold text-forest">Price summary</h2>
          <div className="flex justify-between gap-3 text-[0.95rem]">
            <span className="text-muted">${tour.price} × {travelers} {travelers === 1 ? 'traveler' : 'travelers'}</span>
            <span>${total}</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-4">
            <span className="font-bold text-forest">Total to pay</span>
            <span className="text-2xl font-bold text-forest">${total}</span>
          </div>
          <p className="mt-1 text-right text-xs text-muted">Prices in US dollars</p>

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
                onClick={() => navigate(`/login?next=${encodeURIComponent(backToHere)}`)}
                className="mt-6 w-full cursor-pointer rounded-[5px] bg-brand px-[22px] py-[13px] font-bold text-white hover:bg-forest"
              >
                Sign in to book
              </button>
              <p className="mt-2 text-center text-xs text-muted">Your choices are kept while you sign in.</p>
            </>
          )}

          {payError && (
            <p role="alert" className="mt-3 rounded-[5px] bg-red-50 px-3 py-2 text-sm text-red-700">
              {payError}
            </p>
          )}
        </aside>
      </div>
    </main>
  )
}
