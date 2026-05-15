/**
 * XIRR — Extended Internal Rate of Return
 * Uses Newton-Raphson iteration.
 */

/**
 * @param {Array<{date: Date, amount: number}>} cashflows
 * @param {number} [guess=0.1]
 * @returns {number|null} annualised rate or null if no convergence
 */
export function calculateXIRR(cashflows, guess = 0.1) {
  if (!cashflows || cashflows.length < 2) return null

  const DAYS_IN_YEAR = 365
  const MAX_ITER = 300
  const TOLERANCE = 1e-10

  // Anchor to first date
  const t0 = cashflows[0].date.getTime()

  // year fractions from first date
  const yf = cashflows.map(cf => (cf.date.getTime() - t0) / (DAYS_IN_YEAR * 24 * 3600 * 1000))
  const amounts = cashflows.map(cf => cf.amount)

  let rate = guess

  for (let i = 0; i < MAX_ITER; i++) {
    let fVal = 0
    let fDeriv = 0

    for (let j = 0; j < amounts.length; j++) {
      const factor = Math.pow(1 + rate, yf[j])
      fVal   += amounts[j] / factor
      fDeriv -= (yf[j] * amounts[j]) / ((1 + rate) * factor)
    }

    if (Math.abs(fDeriv) < 1e-15) return null

    const newRate = rate - fVal / fDeriv

    if (Math.abs(newRate - rate) < TOLERANCE) return newRate

    rate = newRate
  }

  return null // did not converge
}

/**
 * Format rate as percentage string
 */
export function formatPercent(rate, decimals = 2) {
  if (rate === null || !isFinite(rate)) return '—'
  return (rate * 100).toFixed(decimals) + '%'
}

/**
 * Parse date string (YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY)
 */
export function parseDate(str) {
  if (!str) return null
  str = str.trim()
  let m

  // YYYY-MM-DD
  m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (m) return new Date(+m[1], +m[2] - 1, +m[3])

  // DD/MM/YYYY or DD-MM-YYYY
  m = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/)
  if (m) return new Date(+m[3], +m[2] - 1, +m[1])

  return null
}

/**
 * Validate cashflow inputs
 * Returns { valid: bool, errors: [] }
 */
export function validateCashflows(rows) {
  const errors = []

  const hasInflow  = rows.some(r => parseFloat(r.amount) > 0)
  const hasOutflow = rows.some(r => parseFloat(r.amount) < 0)

  if (!hasInflow || !hasOutflow) {
    errors.push('XIRR requires at least one positive (inflow) and one negative (outflow) cashflow.')
  }

  rows.forEach((r, i) => {
    if (!parseDate(r.date)) errors.push(`Row ${i + 1}: Invalid date "${r.date}"`)
    if (isNaN(parseFloat(r.amount))) errors.push(`Row ${i + 1}: Invalid amount "${r.amount}"`)
  })

  return { valid: errors.length === 0, errors }
}
