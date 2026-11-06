import { Link } from 'react-router'
import { useI18n } from '../lib/i18n'
import { TripPlanControls } from './TripPlanControls'

export function TourCard({ tour }) {
  const { t, formatPrice } = useI18n()
  const href = `/tours/${tour.slug}`

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-white">
      {/* The photo also opens the tour page, but only the title link is announced to screen readers. */}
      <Link to={href} tabIndex={-1} aria-hidden="true">
        <img src={tour.imageUrl} alt="" loading="lazy" className="h-[220px] w-full object-cover sm:h-[210px]" />
      </Link>
      <div className="flex flex-1 flex-col p-[18px]">
        <p className="mb-1 text-xs font-bold tracking-[1.5px] text-brand uppercase">{t(`tours.categories.${tour.category}`)}</p>
        <h3 className="mb-1 text-xl leading-snug font-bold text-forest">
          <Link to={href} className="hover:text-brand">
            {tour.name}
          </Link>
        </h3>
        <p className="mb-3 text-sm text-muted">{tour.summary}</p>
        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-2 text-[0.9rem]">
          <span className="text-muted">{tour.duration}</span>
          <span>
            <strong className="text-brand">{formatPrice(tour.price)}</strong>{' '}
            <span className="text-xs text-muted">
              {tour.priceUnit === 'vehicle' ? `${t('card.perVehicle')} · ${t('card.upTo', { count: tour.maxGuests })}` : t('card.perPerson')}
            </span>
          </span>
        </div>
        <TripPlanControls tour={tour} />
      </div>
    </article>
  )
}
