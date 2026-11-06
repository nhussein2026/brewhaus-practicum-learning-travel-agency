// All prices are whole units of this currency (Turkish lira). Stripe wants the smallest unit (kuruş), so × 100.
export const CURRENCY = 'try'

// The one place that knows how a line is priced:
// - 'person'  → price per traveler, so price × travelers
// - 'vehicle' → one price for the whole van, however many travelers (up to the tour's maxGuests)
export function lineTotal(price, priceUnit, travelers) {
  return priceUnit === 'vehicle' ? price : price * travelers
}
