import { useEffect, useState } from 'react'
import { SectionHeading } from './SectionHeading'
import { TourCard } from './TourCard'

const regions = ['All', 'Europe', 'Asia', 'Middle East']

export function Tours() {
  const [tours, setTours] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  // The selected region is the only filter state. The visible list is derived from it on every render.
  const [region, setRegion] = useState('All')

  // Load the tours from our API once, when the section first appears.
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

      {status === 'loading' && <p className="text-center text-muted">Loading tours...</p>}
      {status === 'error' && (
        <p role="alert" className="text-center text-muted">
          We couldn't load the tours right now. Please try again in a moment.
        </p>
      )}

      {/* 1 column on phones, 2 from sm, 3 from md. */}
      {status === 'ready' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {filtered.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </section>
  )
}
