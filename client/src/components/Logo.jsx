import { Link } from 'react-router'

export function Logo() {
  return (
    <Link to="/" className="text-[1.6rem] font-bold tracking-tighter text-forest">
      wanderly<span className="text-brand">.</span>
    </Link>
  )
}
