import { Link } from 'react-router'
import { useI18n } from '../lib/i18n'
import { sitePhotos } from '../data/site-photos'

export function Hero() {
  const { t } = useI18n()

  return (
    <section
      aria-labelledby="hero-title"
      className="flex min-h-[460px] items-center bg-cover bg-center bg-no-repeat px-[5%] py-[70px] text-white sm:min-h-[530px] sm:py-[90px]"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(13, 38, 37, 0.82), rgba(13, 38, 37, 0.2)), url("${sitePhotos.hero.url}")`,
      }}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-sand">{t('hero.eyebrow')}</p>
        <h1 id="hero-title" className="mb-[18px] max-w-[700px] text-[2.3rem] leading-[1.08] font-bold sm:text-6xl">
          {t('hero.title')}
        </h1>
        <p className="mb-7 max-w-[540px] text-lg">{t('hero.text')}</p>
        <div className="flex flex-wrap gap-3">
          <a href="/#tours" className="inline-block rounded-[5px] bg-brand px-[22px] py-[13px] font-bold hover:bg-forest">
            {t('hero.cta')}
          </a>
          {/* A router Link (not <a>): changing ?category with a plain link would reload the whole page. */}
          <Link
            to="/?category=transfer#tours"
            className="inline-block rounded-[5px] border border-white/70 px-[22px] py-[13px] font-bold hover:bg-white hover:text-forest"
          >
            {t('hero.secondary')}
          </Link>
        </div>
      </div>
    </section>
  )
}
