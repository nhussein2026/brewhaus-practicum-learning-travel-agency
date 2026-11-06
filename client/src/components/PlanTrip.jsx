import { CONTACT_EMAIL } from '../lib/config'
import { useI18n } from '../lib/i18n'
import { WhatsAppButton } from './WhatsAppButton'

export function PlanTrip() {
  const { t } = useI18n()
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('plan.emailSubject'))}`

  return (
    <section id="plan" aria-labelledby="plan-title" className="bg-forest px-[5%] py-[70px] text-center text-white">
      <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-sand">{t('plan.eyebrow')}</p>
      <h2 id="plan-title" className="mb-3 text-[1.8rem] leading-[1.2] font-bold sm:text-4xl">
        {t('plan.title')}
      </h2>
      <p className="mx-auto mb-[25px] max-w-[580px] text-[#d8e4df]">{t('plan.text')}</p>
      <div className="flex flex-wrap justify-center gap-3">
        {/* WhatsApp is how most travelers contact agencies here; shown only when a number is configured. */}
        <WhatsAppButton message={t('plan.whatsappMessage')} label={t('plan.whatsapp')} className="inline-block" />
        <a href={mailto} className="inline-block rounded-[5px] bg-sand px-[22px] py-[11px] font-bold text-forest hover:bg-white">
          {t('plan.email')}
        </a>
      </div>
    </section>
  )
}
