import { useState } from 'react'
import { Link } from 'react-router'
import { useTripPlan } from '../lib/trip-plan'
import { useI18n } from '../lib/i18n'
import { lineTotal } from '../lib/pricing'
import { TravelerStepper } from './TravelerStepper'

// Travelers stepper + total + "Add to trip plan" for one tour. Used on the tour card and the tour page.
export function TripPlanControls({ tour }) {
  const { t, formatPrice } = useI18n()
  const { plans, savePlan } = useTripPlan()
  const inPlan = plans.find((plan) => plan.tourId === tour.id)

  // The controls keep their own traveler count and hand it to the stepper.
  // If this tour is already in the trip plan, start from that count.
  const [travelers, setTravelers] = useState(inPlan?.travelers ?? 1)
  const changed = inPlan && inPlan.travelers !== travelers

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[0.9rem]">
        <span className="text-muted">{t('card.travelers')}</span>
        <TravelerStepper value={travelers} onChange={setTravelers} max={tour.maxGuests} />
      </div>
      <p className="mt-2 text-right text-sm text-muted">
        {t('card.total')}: <strong className="text-forest">{formatPrice(lineTotal(tour.price, tour.priceUnit, travelers))}</strong>
      </p>

      {/* Adds this tour to the trip plan. Nothing is paid until the booking page. */}
      {inPlan && !changed ? (
        <Link
          to="/booking"
          className="mt-4 block w-full rounded-[5px] border border-brand px-4 py-2.5 text-center font-bold text-brand hover:bg-mist"
        >
          {t('card.inPlan')}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => savePlan(tour.id, travelers)}
          className="mt-4 w-full cursor-pointer rounded-[5px] bg-brand px-4 py-2.5 font-bold text-white hover:bg-forest"
        >
          {changed ? t('card.update', { count: travelers }) : t('card.add')}
        </button>
      )}
    </>
  )
}
