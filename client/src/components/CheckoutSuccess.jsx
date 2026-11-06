import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useTripPlan } from '../lib/trip-plan'
import { useI18n } from '../lib/i18n'
import { errorMessage } from '../lib/errors'

const MAX_TRIES = 6
const RETRY_MS = 1500

// Stripe sends the buyer here after paying: /checkout/success?order=123
// Stripe's webhook can arrive a moment after this redirect, so while the
// order still says 'pending' we ask the API again a few times.
export function CheckoutSuccess() {
  const { lang, t, formatPrice } = useI18n()
  const [params] = useSearchParams()
  const orderId = params.get('order')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [gaveUp, setGaveUp] = useState(false)
  const { clearPlans } = useTripPlan()

  // Once the payment is confirmed, the booked tours leave the trip plan.
  const paid = order?.status === 'paid'
  useEffect(() => {
    if (paid) clearPlans()
  }, [paid, clearPlans])

  useEffect(() => {
    let cancelled = false
    let timer

    async function check(attempt) {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(orderId ?? '')}?lang=${lang}`)
        const data = await response.json()
        if (cancelled) return
        if (!response.ok) {
          setError(errorMessage(t, data.code))
          return
        }

        setOrder(data)
        if (data.status === 'pending') {
          if (attempt < MAX_TRIES) timer = setTimeout(() => check(attempt + 1), RETRY_MS)
          else setGaveUp(true)
        }
      } catch {
        if (!cancelled) setError(t('errors.network'))
      }
    }

    check(1)
    // Stop polling if the user leaves the page (or switches language, which starts a fresh check).
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // t is rebuilt only when the language changes, so this re-runs on a new order id or language.
  }, [orderId, lang, t])

  return (
    <main className="mx-auto w-[90%] max-w-lg py-[58px] sm:py-[82px]">
      {error ? (
        <Message eyebrow={t('success.errorEyebrow')} title={t('success.errorTitle')}>
          {error}
        </Message>
      ) : !order || (order.status === 'pending' && !gaveUp) ? (
        <Message eyebrow={t('success.waitEyebrow')} title={t('success.waitTitle')}>
          {t('success.waitText')}
        </Message>
      ) : order.status === 'paid' ? (
        <>
          <Message eyebrow={t('success.paidEyebrow')} title={t('success.paidTitle')}>
            {t('success.paidText', { id: order.id })}
          </Message>
          <OrderSummary order={order} t={t} formatPrice={formatPrice} />
        </>
      ) : (
        <Message
          eyebrow={t('success.statusEyebrow', { id: order.id })}
          title={t('success.statusTitle', { status: t(`success.statuses.${order.status}`) })}
        >
          {order.status === 'pending' ? t('success.stillPending') : t('success.notCompleted')}
        </Message>
      )}

      <Link to="/" className="mt-8 inline-block font-bold text-brand">
        {t('success.back')}
      </Link>
    </main>
  )
}

function Message({ eyebrow, title, children }) {
  return (
    <div role="status">
      <p className="mb-3 text-[0.78rem] font-bold tracking-[2px] text-brand">{eyebrow}</p>
      <h1 className="mb-3 text-[1.8rem] leading-[1.2] font-bold text-forest sm:text-4xl">{title}</h1>
      <p className="text-muted">{children}</p>
    </div>
  )
}

function OrderSummary({ order, t, formatPrice }) {
  const money = (amount) => formatPrice(amount, order.currency)
  return (
    <div className="mt-8 space-y-2 rounded-lg bg-mist p-6">
      {order.items.map((item) => (
        <div key={item.tourId} className="flex flex-wrap justify-between gap-2">
          <span className="min-w-0">
            <strong className="text-forest">{item.tourName}</strong>
            {item.duration && <span className="text-muted"> · {item.duration}</span>}
          </span>
          <span className="text-muted">
            {item.priceUnit === 'vehicle'
              ? `${t('success.vehicle', { count: item.travelers })} · ${money(item.lineTotal)}`
              : `${item.travelers} × ${money(item.unitPrice)}`}
          </span>
        </div>
      ))}
      <div className="mt-4 flex justify-between border-t border-line pt-4 font-bold text-forest">
        <span>{t('success.totalPaid')}</span>
        <span>{money(order.total)}</span>
      </div>
    </div>
  )
}
