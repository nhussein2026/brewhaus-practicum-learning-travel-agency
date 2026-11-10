import { DEMO_MODE } from '../lib/config'
import { useI18n } from '../lib/i18n'

// A thin strip above the header so nobody mistakes the demo for a real agency.
export function DemoBanner() {
  const { t } = useI18n()
  if (!DEMO_MODE) return null

  return (
    <p role="note" className="bg-sand px-[5%] py-2 text-center text-[0.82rem] leading-snug text-forest">
      {t('demo.banner')}
    </p>
  )
}
