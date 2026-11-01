import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

const MAX_TRIES = 6
const RETRY_MS = 1500

// Stripe sends the buyer here after paying: /checkout/success?order=123
// Stripe's webhook can arrive a moment after this redirect, so while the
// order still says 'pending' we ask the API again a few times.
export function CheckoutSuccess() {
  const [params] = useSearchParams()
  const orderId = params.get('order')
  const [order, setOrder] = useState(null)
  const [error, setError] = useState(null)
  const [gaveUp, setGaveUp] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timer

    async function check(attempt) {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        const data = await response.json()
        if (cancelled) return
        if (!response.ok) throw new Error(data.error ?? 'Could not load your order')

        setOrder(data)
        if (data.status === 'pending') {
          if (attempt < MAX_TRIES) timer = setTimeout(() => check(attempt + 1), RETRY_MS)
          else setGaveUp(true)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    check(1)
    // Stop polling if the user leaves the page.
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [orderId])

  return (
    <main className="mx-auto w-[90%] max-w-lg py-[58px] sm:py-[82px]">
      {error ? (
        <Message eyebrow="SOMETHING WENT WRONG" title="We couldn't find that order.">
          {error}
        </Message>
      ) : !order || (order.status === 'pending' && !gaveUp) ? (
        <Message eyebrow="ONE MOMENT" title="Confirming your payment...">
          Stripe is letting us know your payment went through.
        </Message>
      ) : order.status === 'paid' ? (
        <>
          <Message eyebrow="PAYMENT RECEIVED" title="You're going on a trip!">
            Order #{order.id} is <strong className="text-brand">paid</strong>. A confirmation is on its way to your email.
          </Message>
          <OrderSummary order={order} />
        </>
      ) : (
        <Message eyebrow={`ORDER #${order.id}`} title={`Status: ${order.status}`}>
          {order.status === 'pending'
            ? "We haven't received Stripe's confirmation yet. Refresh this page in a minute."
            : 'This checkout was not completed, so you have not been charged.'}
        </Message>
      )}

      <Link to="/" className="mt-8 inline-block font-bold text-brand">
        ← Back to all tours
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

function OrderSummary({ order }) {
  return (
    <div className="mt-8 rounded-lg bg-mist p-6">
      {order.items.map((item) => (
        <div key={item.tourName} className="flex flex-wrap justify-between gap-2">
          <span>
            <strong className="text-forest">{item.tourName}</strong>
            <span className="text-muted">, {item.country} · {item.days} days</span>
          </span>
          <span className="text-muted">
            {item.travelers} × ${item.unitPrice}
          </span>
        </div>
      ))}
      <div className="mt-4 flex justify-between border-t border-line pt-4 font-bold text-forest">
        <span>Total paid</span>
        <span>${order.total}</span>
      </div>
    </div>
  )
}
