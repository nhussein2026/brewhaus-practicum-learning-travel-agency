import { useState } from 'react'
import { useNavigate } from 'react-router'
import { TravelerStepper } from './TravelerStepper'

export function TourCard({ tour }) {
  // Each card keeps its own traveler count and hands it to the stepper.
  const [travelers, setTravelers] = useState(1)
  const navigate = useNavigate()

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
        {/* Opens the review page with this card's choices. Nothing is paid yet. */}
        <button
          type="button"
          onClick={() => navigate(`/book/${tour.slug}?travelers=${travelers}`)}
          className="mt-4 w-full cursor-pointer rounded-[5px] bg-brand px-4 py-2.5 font-bold text-white hover:bg-forest"
        >
          Book now
        </button>
      </div>
    </article>
  )
}
