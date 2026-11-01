import { Logo } from './Logo'

const links = [
  { href: '#tours', label: 'Tours' },
  { href: '#about', label: 'About' },
  { href: '#reviews', label: 'Reviews' },
]

export function Header() {
  return (
    <header id="home" className="bg-white">
      {/* Mobile: logo stacked above the links. sm and up: one row. */}
      <nav
        aria-label="Main navigation"
        className="mx-auto flex w-[90%] max-w-[1100px] flex-col items-start gap-3.5 py-[18px] sm:min-h-[76px] sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-0"
      >
        <Logo />
        <div className="flex w-full flex-wrap items-center gap-x-[18px] gap-y-3 text-[0.95rem] sm:w-auto sm:gap-[26px]">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-brand">
              {link.label}
            </a>
          ))}
          <a
            href="#plan"
            className="rounded-[5px] bg-brand px-4 py-2.5 text-white hover:bg-forest"
          >
            Plan your trip
          </a>
        </div>
      </nav>
    </header>
  )
}
