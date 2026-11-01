import { useEffect } from 'react'
import { useLocation } from 'react-router'

// React Router swaps pages without a real page load, so the browser keeps the
// old scroll position. On every path change:
// - a URL with a section (e.g. /#tours) scrolls to that section. The browser can't
//   do it alone, because React draws the section only after the page has loaded.
// - any other URL jumps back to the top.
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const section = hash && document.getElementById(hash.slice(1))
    if (section) section.scrollIntoView({ behavior: 'instant' })
    else window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])

  return null
}
