import { useI18n } from '../lib/i18n'
import { sitePhotos } from '../data/site-photos'

export function About() {
  const { lang, t } = useI18n()

  return (
    // Mobile: image stacked above text. md and up: side by side.
    <section
      id="about"
      aria-labelledby="about-title"
      className="mx-auto flex w-[90%] max-w-[1100px] flex-col gap-[30px] py-[58px] sm:py-[82px] md:flex-row md:items-center md:gap-[55px]"
    >
      <div className="min-w-0 md:flex-1">
        <img
          src={sitePhotos.about.url}
          alt={sitePhotos.about.alt[lang]}
          loading="lazy"
          className="h-full max-h-[300px] min-h-[230px] w-full rounded-lg object-cover md:max-h-none md:min-h-[360px]"
        />
      </div>
      <div className="min-w-0 md:flex-1">
        <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-brand">{t('about.eyebrow')}</p>
        <h2 id="about-title" className="mb-3 text-[1.8rem] leading-[1.2] font-bold text-forest sm:text-4xl">
          {t('about.title')}
        </h2>
        <p className="text-muted">{t('about.text')}</p>
        <ul className="my-5 space-y-2">
          {t('about.points').map((point) => (
            <li key={point} className="flex gap-2">
              <span aria-hidden="true" className="text-brand">
                ✓
              </span>
              {point}
            </li>
          ))}
        </ul>
        <a href="/#plan" className="inline-block font-bold text-brand">
          {t('about.link')}
        </a>
      </div>
    </section>
  )
}
