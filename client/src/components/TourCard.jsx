import { useState } from 'react'
import { Link } from 'react-router'
import { useTripPlan } from '../lib/trip-plan'
import { TravelerStepper } from './TravelerStepper'

export function TourCard({ tour }) {
  const { plans, savePlan } = useTripPlan()
  const inPlan = plans.find((plan) => plan.tourId === tour.id)

  // Each card keeps its own traveler count and hands it to the stepper.
  // If this tour is already in the trip plan, start from that count.
  const [travelers, setTravelers] = useState(inPlan?.travelers ?? 1)
  const changed = inPlan && inPlan.travelers !== travelers

  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-line bg-white">
      <img src={tour.imageUrl} alt={tour.imageAlt} className="h-[220px] w-full object-cover sm:h-[210px]" />
      <div className="p-[18px]">
        <p className="mb-1 text-xs font-bold tracking-[1.5px] text-brand uppercase">{tour.country}</p>
        <h3 className="mb-[18px] text-xl font-bold text-forest">{tour.name}</h3>
        <div className="flex flex-wrap items-center justify-between gap-2 text-[0.9rem]">
          <span className="text-muted">{tour.days} days</span>
          <strong className="text-brand">From ${tour.price}</strong>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-[0.9rem]">
          <span className="text-muted">Travelers</span>
          <TravelerStepper value={travelers} onChange={setTravelers} />
        </div>
        <p className="mt-2 text-right text-sm text-muted">
          Total: <strong className="text-forest">${tour.price * travelers}</strong>
        </p>

        {/* Adds this tour to the trip plan. Nothing is paid until the booking page. */}
        {inPlan && !changed ? (
          <Link
            to="/booking"
            className="mt-4 block w-full rounded-[5px] border border-brand px-4 py-2.5 text-center font-bold text-brand hover:bg-mist"
          >
            ✓ In your trip plan · View
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => savePlan(tour.id, travelers)}
            className="mt-4 w-full cursor-pointer rounded-[5px] bg-brand px-4 py-2.5 font-bold text-white hover:bg-forest"
          >
            {changed ? `Update to ${travelers} ${travelers === 1 ? 'traveler' : 'travelers'}` : 'Add to trip plan'}
          </button>
        )}
      </div>
    </article>
  )
}
