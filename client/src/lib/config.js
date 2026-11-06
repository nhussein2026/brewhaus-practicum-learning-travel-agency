// Site settings that come from build-time environment variables (Vite exposes VITE_* ones).
// Set them in client/.env.local for development, and in Vercel's project settings for production.

// Demo mode (default ON): shows the "this is a demo" banner, labels the reviews as samples and
// tells search engines not to index the site. Set VITE_DEMO_MODE=false only for a real business.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false'

// WhatsApp number in international format, e.g. 905551234567. Without it, the WhatsApp buttons are hidden.
const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')

// A wa.me link opens WhatsApp with the message already typed in. Returns null when no number is set.
export function whatsappLink(message) {
  return WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}` : null
}

export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'hello@wanderly.example'
