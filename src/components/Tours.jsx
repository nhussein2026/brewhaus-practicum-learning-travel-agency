import { tours } from '../data/tours'
import { SectionHeading } from './SectionHeading'
import { TourCard } from './TourCard'

export function Tours() {
  return (
    <section id="tours" aria-labelledby="tours-title" className="mx-auto w-[90%] max-w-[1100px] py-[58px] sm:py-[82px]">
      <SectionHeading eyebrow="CHOOSE YOUR ADVENTURE" title="Popular tour packages" id="tours-title">
        Handpicked trips for your next unforgettable getaway.
      </SectionHeading>

      {/* 1 column on phones, 2 from sm, 3 from md. */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </section>
  )
}
