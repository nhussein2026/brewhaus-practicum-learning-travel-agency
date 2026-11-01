import { reviews } from '../data/reviews'
import { SectionHeading } from './SectionHeading'

export function Reviews() {
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="mx-auto w-[90%] max-w-[1100px] pt-[35px] pb-[58px] sm:pb-[82px]">
      <SectionHeading eyebrow="KIND WORDS FROM TRAVELERS" title="Stories from our travelers" id="reviews-title" />

      {/* Full-width cards until md, then three across. */}
      <div className="grid grid-cols-1 gap-[22px] md:grid-cols-3">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-lg bg-mist p-6">
            <p className="mb-3 tracking-[3px] text-star" aria-label={`${review.rating} out of 5 stars`}>
              {'★'.repeat(review.rating)}
            </p>
            <blockquote className="mb-[18px]">“{review.quote}”</blockquote>
            <p className="font-bold text-brand">— {review.name}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
