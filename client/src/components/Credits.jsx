import { useI18n } from '../lib/i18n'
import { useTours } from '../lib/use-tours'
import { sitePhotos } from '../data/site-photos'

// /credits: who took each photo and under which licence. CC BY and CC BY-SA licences
// require this credit (author + licence + link); CC0 doesn't, but we credit everyone anyway.
export function Credits() {
  const { t } = useI18n()
  const { tours } = useTours()

  const rows = [
    { key: 'hero', label: `${t('credits.site')} · ${t('credits.hero')}`, image: sitePhotos.hero.url, credit: sitePhotos.hero },
    { key: 'about', label: `${t('credits.site')} · ${t('credits.about')}`, image: sitePhotos.about.url, credit: sitePhotos.about },
    ...tours
      .filter((tour) => tour.imageCredit)
      .map((tour) => ({ key: tour.slug, label: tour.name, image: tour.imageUrl, credit: tour.imageCredit })),
  ]

  return (
    <main className="mx-auto w-[90%] max-w-[900px] py-[58px] sm:py-[82px]">
      <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-brand">{t('credits.eyebrow')}</p>
      <h1 className="mb-3 text-[1.8rem] leading-[1.2] font-bold text-forest sm:text-4xl">{t('credits.title')}</h1>
      <p className="mb-8 text-muted">{t('credits.intro')}</p>

      <ul className="divide-y divide-line">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-4 py-3">
            <img src={row.image} alt="" loading="lazy" className="h-14 w-20 shrink-0 rounded object-cover" />
            <div className="min-w-0 text-sm">
              <p className="font-bold text-forest">{row.label}</p>
              <p className="text-muted">
                {row.credit.author} ·{' '}
                <a href={row.credit.licenseUrl} target="_blank" rel="noreferrer" className="underline hover:text-brand">
                  {row.credit.license}
                </a>{' '}
                ·{' '}
                <a href={row.credit.sourceUrl} target="_blank" rel="noreferrer" className="underline hover:text-brand">
                  {t('credits.original')}
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
