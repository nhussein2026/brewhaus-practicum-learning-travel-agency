import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { en } from '../i18n/en'
import { tr } from '../i18n/tr'

// i18n = "internationalisation" (18 letters between the i and the n).
// The chosen language lives in React context, so every component can read it with useI18n().
const dictionaries = { en, tr }
export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'tr', label: 'TR', name: 'Türkçe' },
]
const STORAGE_KEY = 'wanderly.lang'
const I18nContext = createContext(null)

// Which language to start in:
// 1. ?lang=tr in the URL (handy for sending the Turkish version as a link),
// 2. the visitor's earlier choice, 3. the browser's language, 4. English.
function startLanguage() {
  const isKnown = (code) => code in dictionaries
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang')
    if (isKnown(fromUrl)) return fromUrl
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isKnown(saved)) return saved
  } catch {
    // localStorage can be blocked; carry on with the browser language.
  }
  const browser = (navigator.languages ?? [navigator.language]).map((code) => code?.slice(0, 2))
  return browser.find(isKnown) ?? 'en'
}

// Reads 'booking.title' out of the nested dictionary.
function lookup(dictionary, key) {
  return key.split('.').reduce((node, part) => node?.[part], dictionary)
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(startLanguage)

  // Keep <html lang="..">, the tab title and the saved choice in step with the language.
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = dictionaries[lang].meta.title
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // Not saved; fine for this visit.
    }
  }, [lang])

  const setLang = useCallback((code) => {
    if (code in dictionaries) setLangState(code)
  }, [])

  const value = useMemo(() => {
    const dictionary = dictionaries[lang]
    const plural = new Intl.PluralRules(lang)
    const numberLocale = lang === 'tr' ? 'tr-TR' : 'en-US'
    const moneyFormat = (currency) =>
      new Intl.NumberFormat(numberLocale, {
        style: 'currency',
        currency,
        currencyDisplay: 'narrowSymbol', // "₺1,850" instead of "TRY 1,850"
        maximumFractionDigits: 0,
      })
    const lira = moneyFormat('TRY')

    // t('nav.myTrip') → "My trip". Variables fill {placeholders}: t('card.upTo', { count: 8 }).
    // If the entry is { one, other } and a count is given, the right plural form is chosen.
    function t(key, vars = {}) {
      let text = lookup(dictionary, key) ?? lookup(en, key) ?? key
      if (typeof text === 'object' && 'other' in text) text = text[plural.select(vars.count ?? 0)] ?? text.other
      if (typeof text !== 'string') return text // arrays and objects (e.g. lists of points) are returned as-is
      return text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match))
    }

    // Prices are Turkish lira; older orders may carry another currency (e.g. 'usd'), so it can be passed in.
    const formatPrice = (amount, currency = 'TRY') =>
      (currency.toUpperCase() === 'TRY' ? lira : moneyFormat(currency.toUpperCase())).format(amount)

    return { lang, setLang, t, formatPrice }
  }, [lang, setLang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
