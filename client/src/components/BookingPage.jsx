import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSession } from '../lib/auth-client'
import { useTripPlan } from '../lib/trip-plan'
import { useI18n } from '../lib/i18n'
import { useTours } from '../lib/use-tours'
import { lineTotal } from '../lib/pricing'
import { errorMessage } from '../lib/errors'
import { TravelerStepper } from './TravelerStepper'

// /booking: the last step before paying. Shows every tour in the trip plan,
// what each costs and the grand total. Nothing is charged here.
// "Proceed to payment" starts ONE Stripe checkout for all of them.
export function BookingPage() {
  const { lang, t, formatPrice } = useI18n()
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()
  const { plans, savePlan, removePlan } = useTripPlan()
  const { tours, status } = useTours()

  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState(null)

  // Join each plan with its tour. The traveler count is capped at the tour's group size.
  const lines = plans
    .map((plan) => {
      const tour = tours.find((item) => item.id === plan.tourId)
      return { ...plan, tour, travelers: tour ? Math.min(plan.travelers, tour.maxGuests) : plan.travelers }
    })
    .filter((line) => line.tour)
  const total = lines.reduce((sum, line) => sum + lineTotal(line.tour.price, line.tour.priceUnit, line.travelers), 0)
  const guestCount = lines.reduce((sum, line) => sum + line.travelers, 0)

  // A saved plan can still hold tours we no longer sell (e.g. from before the Black Sea update).
  // Once the list has loaded, drop those so the header count matches what's shown here.
  useEffect(() => {
    if (status !== 'ready') return
    for (const plan of plans) {
      if (!tours.some((tour) => tour.id === plan.tourId)) removePlan(plan.tourId)
    }
  }, [status, tours, plans, removePlan])

  async function handlePay() {
    setPaying(true)
    setPayError(null)
    try {
      // Only tour ids and traveler counts are sent. The server works out every price again itself.
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lang, items: lines.map((line) => ({ tourId: line.tourId, travelers: line.travelers })) }),
      })
      const data = await response.json()
      if (!response.ok) {
        setPayError(errorMessage(t, data.code))
        setPaying(false)
        return
      }

      // Leave our site for Stripe's hosted checkout page.
      window.location.assign(data.url)
    } catch {
      setPayError(t('errors.network'))
      setPaying(false)
    }
  }

  return (
    <main className="mx-auto w-[90%] max-w-[1100px] py-[58px] sm:py-[82px]">
      <Link to="/#tours" className="mb-6 inline-block font-bold text-brand">
        {t('booking.keepBrowsing')}
      </Link>
      <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-brand">{t('booking.eyebrow')}</p>
      <h1 className="mb-8 text-[1.8rem] leading-[1.2] font-bold text-forest sm:text-4xl">{t('booking.title')}</h1>

      {status === 'loading' && <p className="text-muted">{t('booking.loading')}</p>}
      {status === 'error' && (
        <p role="alert" className="text-muted">
          {t('tours.error')}
        </p>
      )}

      {status === 'ready' && lines.length === 0 && (
        <div className="rounded-lg bg-mist p-6 text-center">
          <p className="mb-4 text-muted">{t('booking.empty')}</p>
          <Link to="/#tours" className="inline-block rounded-[5px] bg-brand px-[22px] py-[13px] font-bold text-white hover:bg-forest">
            {t('booking.explore')}
          </Link>
        </div>
      )}

      {status === 'ready' && lines.length > 0 && (
        // Mobile: stacked. md and up: tours on the left, price summary on the right.
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start">
          <ul aria-label={t('booking.listLabel')} className="min-w-0 space-y-4">
            {lines.map((line) => (
              <li key={line.tourId} className="flex flex-col overflow-hidden rounded-lg border border-line bg-white sm:flex-row">
                {/* The text sets the row height; the photo just fills its box. */}
                <div className="relative h-[160px] sm:h-auto sm:w-[180px] sm:shrink-0">
                  <img src={line.tour.imageUrl} alt={line.tour.imageAlt} className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 p-[18px]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="mb-1 text-xs font-bold tracking-[1.5px] text-brand uppercase">{t(`tours.categories.${line.tour.category}`)}</p>
                      <h2 className="text-xl font-bold text-forest">
                        <Link to={`/tours/${line.tour.slug}`} className="hover:text-brand">
                          {line.tour.name}
                        </Link>
                      </h2>
                      <p className="text-sm text-muted">
                        {line.tour.duration} ·{' '}
                        {line.tour.priceUnit === 'vehicle'
                          ? t('booking.perVehicle', { price: formatPrice(line.tour.price), count: line.tour.maxGuests })
                          : t('booking.perPerson', { price: formatPrice(line.tour.price) })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePlan(line.tourId)}
                      aria-label={t('booking.removeLabel', { name: line.tour.name })}
                      className="cursor-pointer text-sm text-muted hover:text-red-700"
                    >
                      {t('booking.remove')}
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <TravelerStepper value={line.travelers} max={line.tour.maxGuests} onChange={(n) => savePlan(line.tourId, n)} />
                    <strong className="text-forest">{formatPrice(lineTotal(line.tour.price, line.tour.priceUnit, line.travelers))}</strong>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside aria-label={t('booking.summary')} className="min-w-0 rounded-lg bg-mist p-[18px] sm:p-6 md:sticky md:top-6">
            <h2 className="mb-4 text-xl font-bold text-forest">{t('booking.summary')}</h2>
            <ul className="space-y-2 text-[0.95rem]">
              {lines.map((line) => (
                <li key={line.tourId} className="flex justify-between gap-3">
                  <span className="min-w-0 text-muted">
                    {line.tour.priceUnit === 'vehicle'
                      ? t('booking.lineVehicle', { name: line.tour.name })
                      : `${line.tour.name} · ${formatPrice(line.tour.price)} × ${line.travelers}`}
                  </span>
                  <span className="whitespace-nowrap">{formatPrice(lineTotal(line.tour.price, line.tour.priceUnit, line.travelers))}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-line pt-4">
              <span className="font-bold text-forest">{t('booking.totalToPay')}</span>
              <span className="text-2xl font-bold text-forest">{formatPrice(total)}</span>
            </div>
            <p className="mt-1 text-right text-xs text-muted">
              {t('booking.tourCount', { count: lines.length })} · {t('booking.guestCount', { count: guestCount })} · {t('booking.currencyNote')}
            </p>

            {isPending ? null : session?.user ? (
              <>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={paying}
                  className="mt-6 w-full cursor-pointer rounded-[5px] bg-brand px-[22px] py-[13px] font-bold text-white hover:bg-forest disabled:cursor-wait disabled:opacity-60"
                >
                  {paying ? t('booking.paying') : t('booking.pay', { total: formatPrice(total) })}
                </button>
                <p className="mt-2 text-center text-xs text-muted">{t('booking.payNote', { email: session.user.email })}</p>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`/login?next=${encodeURIComponent('/booking')}`)}
                  className="mt-6 w-full cursor-pointer rounded-[5px] bg-brand px-[22px] py-[13px] font-bold text-white hover:bg-forest"
                >
                  {t('booking.signInToBook')}
                </button>
                <p className="mt-2 text-center text-xs text-muted">{t('booking.signInNote')}</p>
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
