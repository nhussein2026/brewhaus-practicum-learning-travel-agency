import { useState } from 'react'
import { tours } from '../data/tours'
import { SectionHeading } from './SectionHeading'
import { TourCard } from './TourCard'

const regions = ['All', 'Europe', 'Asia', 'Middle East']

export function Tours() {
  // The selected region is the only state. The visible list is derived from it on every render.
  const [region, setRegion] = useState('All')
  const filtered = region === 'All' ? tours : tours.filter((tour) => tour.region === region)

  return (
    <section id="tours" aria-labelledby="tours-title" className="mx-auto w-[90%] max-w-[1100px] py-[58px] sm:py-[82px]">
      <SectionHeading eyebrow="CHOOSE YOUR ADVENTURE" title="Popular tour packages" id="tours-title">
        Handpicked trips for your next unforgettable getaway.
      </SectionHeading>

      <div className="mb-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter tours by region">
        {regions.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setRegion(name)}
            aria-pressed={region === name}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              region === name
                ? 'bg-brand text-white'
                : 'border border-line text-muted hover:border-brand hover:text-brand'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* 1 column on phones, 2 from sm, 3 from md. */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
        {filtered.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </section>
  )
}
