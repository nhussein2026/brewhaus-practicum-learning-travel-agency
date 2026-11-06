// Turns an id from the outside world (URL, request body, webhook metadata) into a
// positive whole number, or null if it isn't one.
// Number('abc') and Number(undefined) are NaN, and Postgres rejects NaN for an
// integer column, which would surface as a 500. Checking first lets us answer 400/404.
export function parseId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}
