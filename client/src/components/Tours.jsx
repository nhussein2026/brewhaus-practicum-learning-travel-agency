import { useSearchParams } from 'react-router'
import { useI18n } from '../lib/i18n'
import { useTours } from '../lib/use-tours'
import { SectionHeading } from './SectionHeading'
import { TourCard } from './TourCard'

const categories = ['all', 'day', 'hiking', 'private', 'transfer']

export function Tours() {
  const { t } = useI18n()
  const { tours, status } = useTours()
  // The chosen category lives in the URL (?category=hiking), so a filtered list can be shared as a link.
  // The visible list is still derived on every render, not stored in state.
  const [params, setParams] = useSearchParams()
  const category = categories.includes(params.get('category')) ? params.get('category') : 'all'
  const filtered = category === 'all' ? tours : tours.filter((tour) => tour.category === category)

  function choose(name) {
    setParams(name === 'all' ? {} : { category: name }, { replace: true, preventScrollReset: true })
  }

  return (
    <section id="tours" aria-labelledby="tours-title" className="mx-auto w-[90%] max-w-[1100px] py-[58px] sm:py-[82px]">
      <SectionHeading eyebrow={t('tours.eyebrow')} title={t('tours.title')} id="tours-title">
        {t('tours.intro')}
      </SectionHeading>

      <div className="mb-8 flex flex-wrap justify-center gap-2" role="group" aria-label={t('tours.filterLabel')}>
        {categories.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => choose(name)}
            aria-pressed={category === name}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm transition ${
              category === name ? 'bg-brand text-white' : 'border border-line text-muted hover:border-brand hover:text-brand'
            }`}
          >
            {t(`tours.categories.${name}`)}
          </button>
        ))}
      </div>

      {status === 'loading' && <p className="text-center text-muted">{t('tours.loading')}</p>}
      {status === 'error' && (
        <p role="alert" className="text-center text-muted">
          {t('tours.error')}
        </p>
      )}
      {status === 'ready' && filtered.length === 0 && <p className="text-center text-muted">{t('tours.empty')}</p>}

      {/* 1 column on phones, 2 from sm, 3 from lg. */}
      {status === 'ready' && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </section>
  )
}
