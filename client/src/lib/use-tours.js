import { useEffect, useState } from 'react'
import { useI18n } from './i18n'

// Loads the tours from our API in the current language, and again whenever the language changes.
// Used by the tour grid, the booking page and the credits page.
export function useTours() {
  const { lang } = useI18n()
  const [tours, setTours] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'

  useEffect(() => {
    // If the language changes again before this answer arrives, ignore the old answer.
    let ignore = false

    async function load() {
      try {
        const response = await fetch(`/api/tours?lang=${lang}`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()
        if (!ignore) {
          setTours(data)
          setStatus('ready')
        }
      } catch (err) {
        console.error('Failed to load tours', err)
        if (!ignore) setStatus('error')
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [lang])

  return { tours, status }
}
