import { Logo } from './Logo'

export function Footer() {
  return (
    // Mobile: stacked. sm and up: spread across one row.
    <footer className="mx-auto flex min-h-[90px] w-[90%] max-w-[1100px] flex-col items-start gap-x-6 gap-y-3 py-[22px] text-[0.9rem] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <Logo />
      <p className="text-muted">Made for curious travelers. © 2026 Wanderly Travel</p>
      <a href="/#home" className="hover:text-brand">Back to top ↑</a>
    </footer>
  )
}
