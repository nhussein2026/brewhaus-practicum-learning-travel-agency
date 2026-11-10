import { reviews } from '../data/reviews'
import { DEMO_MODE } from '../lib/config'
import { useI18n } from '../lib/i18n'
import { SectionHeading } from './SectionHeading'

// These are SAMPLE reviews. Showing invented reviews as real ones would mislead customers,
// so they only appear in demo mode, with a visible label.
export function Reviews() {
  const { lang, t } = useI18n()
  if (!DEMO_MODE) return null

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="mx-auto w-[90%] max-w-[1100px] pt-[35px] pb-[58px] sm:pb-[82px]">
      <SectionHeading eyebrow={t('reviews.eyebrow')} title={t('reviews.title')} id="reviews-title">
        <span className="inline-block rounded-full bg-sand/40 px-3 py-0.5 text-sm text-forest">{t('reviews.sample')}</span>
      </SectionHeading>

      {/* Full-width cards until md, then three across. */}
      <div className="grid grid-cols-1 gap-[22px] md:grid-cols-3">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-lg bg-mist p-6">
            <p className="mb-3 tracking-[3px] text-star" aria-label={`${review.rating} / 5`}>
              {'★'.repeat(review.rating)}
            </p>
            <blockquote className="mb-[18px]">“{review.quote[lang]}”</blockquote>
            <p className="font-bold text-brand">— {review.name}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
