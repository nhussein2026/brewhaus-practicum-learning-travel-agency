import { Link } from 'react-router'
import { useI18n } from '../lib/i18n'

// Any URL that matches no route. (The old site showed its home page for unknown URLs, which confuses
// visitors and search engines alike.)
export function NotFound() {
  const { t } = useI18n()
  return (
    <main className="mx-auto w-[90%] max-w-lg py-[58px] sm:py-[82px]">
      <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-brand">{t('notFound.eyebrow')}</p>
      <h1 className="mb-3 text-[1.8rem] leading-[1.2] font-bold text-forest sm:text-4xl">{t('notFound.title')}</h1>
      <p className="mb-6 text-muted">{t('notFound.text')}</p>
      <Link to="/" className="inline-block rounded-[5px] bg-brand px-[22px] py-[13px] font-bold text-white hover:bg-forest">
        {t('notFound.home')}
      </Link>
    </main>
  )
}
