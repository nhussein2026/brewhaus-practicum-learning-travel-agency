import { LANGUAGES, useI18n } from '../lib/i18n'

// EN | TR buttons. aria-pressed tells screen readers which one is active,
// and lang="tr" on "Türkçe" makes them read that word with Turkish pronunciation.
export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()

  return (
    <div role="group" aria-label={t('nav.language')} className="flex items-center rounded-full border border-line p-0.5 text-xs font-bold">
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          type="button"
          lang={language.code}
          title={language.name}
          aria-label={language.name}
          aria-pressed={lang === language.code}
          onClick={() => setLang(language.code)}
          className={`cursor-pointer rounded-full px-2.5 py-1 transition ${
            lang === language.code ? 'bg-forest text-white' : 'text-muted hover:text-brand'
          }`}
        >
          {language.label}
        </button>
      ))}
    </div>
  )
}
