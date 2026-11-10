import { Link } from 'react-router'
import { useI18n } from '../lib/i18n'
import { Logo } from './Logo'

export function Footer() {
  const { t } = useI18n()

  return (
    // Mobile: stacked. sm and up: spread across one row.
    <footer className="mx-auto flex min-h-[90px] w-[90%] max-w-[1100px] flex-col items-start gap-x-6 gap-y-3 py-[22px] text-[0.9rem] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <Logo />
      <p className="text-muted">{t('footer.made')} © 2026 Wanderly Travel</p>
      <div className="flex gap-5">
        <Link to="/credits" className="hover:text-brand">
          {t('footer.credits')}
        </Link>
        <a href="#home" className="hover:text-brand">
          {t('footer.top')}
        </a>
      </div>
    </footer>
  )
}
