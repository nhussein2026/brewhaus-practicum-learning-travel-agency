// Turns an error code from our API (or from better-auth) into a sentence in the current language.
// Codes we don't know yet fall back to a generic message instead of showing raw English.
export function errorMessage(t, code) {
  if (!code) return t('errors.generic')
  const key = `errors.${code}`
  const message = t(key)
  return message === key ? t('errors.generic') : message
}
