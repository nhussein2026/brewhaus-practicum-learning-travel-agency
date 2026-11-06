import { whatsappLink } from '../lib/config'

// Opens WhatsApp with `message` already typed in. Hidden when no number is configured (VITE_WHATSAPP_NUMBER),
// so the demo never sends people to a number that isn't ours.
export function WhatsAppButton({ message, label, className = 'mt-3 block w-full' }) {
  const href = whatsappLink(message)
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`rounded-[5px] border border-[#1f9d55] bg-white px-4 py-2.5 text-center font-bold text-[#1a7f46] hover:bg-[#eefaf2] ${className}`}
    >
      {label}
    </a>
  )
}
