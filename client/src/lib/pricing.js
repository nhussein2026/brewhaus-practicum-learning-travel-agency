// Same rule as server/src/lib/pricing.js. The browser uses it only to SHOW totals;
// the server works every price out again and that is what gets charged.
export function lineTotal(price, priceUnit, travelers) {
  return priceUnit === 'vehicle' ? price : price * travelers
}
