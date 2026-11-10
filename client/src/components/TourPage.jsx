import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useI18n } from '../lib/i18n'
import { TripPlanControls } from './TripPlanControls'
import { WhatsAppButton } from './WhatsAppButton'

// /tours/:slug: everything about one tour, plus a box to add it to the trip plan.
export function TourPage() {
  const { slug } = useParams()
  const { lang, t, formatPrice } = useI18n()
  // Keep the slug + language the data belongs to, so a stale tour is never shown for a new URL.
  const [result, setResult] = useState({ key: null, status: 'loading', tour: null })
  const key = `${slug}:${lang}`

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const response = await fetch(`/api/tours/${encodeURIComponent(slug)}?lang=${lang}`)
        if (response.status === 404) {
          if (!ignore) setResult({ key, status: 'missing', tour: null })
          return
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const tour = await response.json()
        if (!ignore) setResult({ key, status: 'ready', tour })
      } catch (err) {
        console.error('Failed to load tour', err)
        if (!ignore) setResult({ key, status: 'error', tour: null })
      }
    }
    load()
    return () => {
      ignore = true
    }
  }, [slug, lang, key])

  // Name the browser tab after the tour.
  const tourName = result.tour?.name
  useEffect(() => {
    if (!tourName) return
    const previous = document.title
    document.title = `${tourName} | Wanderly`
    return () => {
      document.title = previous
    }
  }, [tourName])

  const status = result.key === key ? result.status : 'loading'
  const tour = result.tour

  return (
    <main className="mx-auto w-[90%] max-w-[1100px] py-10 sm:py-14">
      <Link to="/#tours" className="mb-6 inline-block font-bold text-brand">
        {t('tour.back')}
      </Link>

      {status === 'loading' && <p className="text-muted">{t('tour.loading')}</p>}
      {status === 'error' && (
        <p role="alert" className="text-muted">
          {t('tours.error')}
        </p>
      )}
      {status === 'missing' && (
        <div>
          <h1 className="mb-3 text-[1.8rem] font-bold text-forest">{t('tour.notFoundTitle')}</h1>
          <p className="text-muted">{t('tour.notFoundText')}</p>
        </div>
      )}

      {status === 'ready' && tour && (
        <article>
          <figure className="mb-8">
            <img src={tour.imageUrl} alt={tour.imageAlt} className="h-[240px] w-full rounded-lg object-cover sm:h-[420px]" />
            {tour.imageCredit && (
              <figcaption className="mt-1.5 text-right text-xs text-muted">
                <a href={tour.imageCredit.sourceUrl} target="_blank" rel="noreferrer" className="hover:text-brand">
                  {t('tour.photo', tour.imageCredit)}
                </a>
              </figcaption>
            )}
          </figure>

          {/* Mobile: one column. md and up: details on the left, booking box on the right. */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-bold tracking-[1.5px] text-brand uppercase">{t(`tours.categories.${tour.category}`)}</p>
              <h1 className="mb-3 text-[1.9rem] leading-[1.15] font-bold text-forest sm:text-[2.5rem]">{tour.name}</h1>
              <p className="mb-6 text-lg text-muted">{tour.summary}</p>

              <dl className="mb-8 grid grid-cols-1 gap-3 rounded-lg bg-mist p-4 text-sm sm:grid-cols-3">
                <Fact label={t('tour.duration')}>{tour.duration}</Fact>
                <Fact label={t('tour.groupSize')}>{t('tour.maxGuests', { count: tour.maxGuests })}</Fact>
                <Fact label={t('tour.price')}>
                  {formatPrice(tour.price)} {tour.priceUnit === 'vehicle' ? t('card.perVehicle') : t('card.perPerson')}
                </Fact>
              </dl>

              <p className="mb-8 leading-relaxed">{tour.description}</p>

              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <List title={t('tour.highlights')} items={tour.highlights} mark="★" />
                <List title={t('tour.included')} items={tour.included} mark="✓" />
              </div>
            </div>

            <aside aria-label={t('tour.bookTitle')} className="min-w-0 rounded-lg border border-line p-[18px] sm:p-6 md:sticky md:top-6">
              <h2 className="text-xl font-bold text-forest">{t('tour.bookTitle')}</h2>
              <p className="mt-1 text-2xl font-bold text-brand">{formatPrice(tour.price)}</p>
              <p className="text-sm text-muted">
                {tour.priceUnit === 'vehicle' ? t('tour.vehicleNote', { count: tour.maxGuests }) : t('tour.personNote')}
              </p>
              {/* key: start fresh if the visitor moves to another tour without leaving the page */}
              <TripPlanControls key={tour.id} tour={tour} />
              <WhatsAppButton message={t('tour.whatsappMessage', { name: tour.name })} label={t('tour.askWhatsApp')} />
            </aside>
          </div>
        </article>
      )}
    </main>
  )
}

function Fact({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-bold tracking-[1px] text-muted uppercase">{label}</dt>
      <dd className="font-bold text-forest">{children}</dd>
    </div>
  )
}

function List({ title, items, mark }) {
  if (!items?.length) return null
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-forest">{title}</h2>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true" className="text-brand">
              {mark}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
