/**
 * parseNumbers.js
 * Smart delimiter detection, numeric/currency parsing, and stat computation
 * for the Average Chart feature.
 */

export const DELIMITER_OPTIONS = [
  { key: 'auto',      label: 'Auto',      regex: null },
  { key: 'comma',     label: 'Comma',     regex: /,/ },
  { key: 'semicolon', label: 'Semicolon', regex: /;/ },
  { key: 'tab',       label: 'Tab',       regex: /\t/ },
  { key: 'space',     label: 'Space',     regex: / / },
  { key: 'newline',   label: 'Newline',   regex: /\n/ },
]

/**
 * Auto-detect the most likely delimiter in a raw string.
 * Returns the delimiter key string: 'comma' | 'semicolon' | 'tab' | 'space' | 'newline'
 */
export function detectDelimiter(raw) {
  const candidates = [
    { key: 'newline',   count: (raw.match(/\n/g)   || []).length },
    { key: 'semicolon', count: (raw.match(/;/g)     || []).length },
    { key: 'comma',     count: (raw.match(/,(?!\d{3}(?:[.,]|\s|$))/g) || []).length }, // prefer commas that are NOT thousand-seps
    { key: 'tab',       count: (raw.match(/\t/g)    || []).length },
    { key: 'space',     count: (raw.match(/ /g)     || []).length },
  ]

  // If there are newlines, they almost certainly are the list delimiter
  // Prefer them unless another candidate has drastically more occurrences
  const best = candidates.reduce((a, b) => (b.count > a.count ? b : a), candidates[0])

  // Fallback: if nothing detected (single value), treat as newline
  return best.count > 0 ? best.key : 'newline'
}

/**
 * Strip currency symbols, thousand-separators and whitespace from a token,
 * returning a clean numeric string suitable for parseFloat.
 */
function cleanToken(token) {
  // Remove currency symbols and leading/trailing whitespace
  let s = token.trim().replace(/^[^0-9.+-]+/, '').replace(/[^0-9.]+$/, '')

  // Handle Indian lakh-style formatting: ₹1,23,456.78 → 123456.78
  // Remove ALL commas that look like thousand-separators
  // A comma is a thousand-sep if the groups after it are 2 or 3 digits followed by either another comma, a dot, or end
  s = s.replace(/,(?=\d{2,3}(?:,|\.|$))/g, '')

  return s
}

/**
 * Build a regex from a delimiter key.
 */
function delimiterRegex(delimKey) {
  switch (delimKey) {
    case 'comma':     return /,/
    case 'semicolon': return /;/
    case 'tab':       return /\t/
    case 'space':     return /\s+/
    case 'newline':   return /\n/
    default:          return /\n/
  }
}

/**
 * Parse a raw multi-line / delimited string into an array of numbers.
 * @param {string}  raw          - Raw user input
 * @param {string}  delimiterKey - 'auto' | 'comma' | 'semicolon' | 'tab' | 'space' | 'newline'
 * @returns {{ values: number[], detected: string, errors: string[] }}
 */
export function parseInput(raw, delimiterKey = 'auto') {
  if (!raw || !raw.trim()) {
    return { values: [], detected: 'newline', errors: [] }
  }

  const detected = delimiterKey === 'auto' ? detectDelimiter(raw) : delimiterKey
  const regex = delimiterRegex(detected)

  const tokens = raw.split(regex)
  const values = []
  const errors = []

  tokens.forEach((token, idx) => {
    const cleaned = cleanToken(token)
    if (cleaned === '' || cleaned === '-') return // skip blank tokens

    const num = parseFloat(cleaned)
    if (isNaN(num)) {
      if (cleaned.length > 0) {
        errors.push(`Token ${idx + 1} "${token.trim().slice(0, 20)}" is not a valid number`)
      }
    } else {
      values.push(num)
    }
  })

  return { values, detected, errors }
}

/**
 * Compute a simple moving average (trailing window).
 * For indices where we don't have a full window yet, we use the partial window.
 * @param {number[]} values
 * @param {number}   window - window size (≥ 1)
 * @returns {number[]}
 */
export function movingAverage(values, window) {
  const w = Math.max(1, Math.round(window))
  return values.map((_, i) => {
    const start = Math.max(0, i - w + 1)
    const slice = values.slice(start, i + 1)
    return slice.reduce((s, v) => s + v, 0) / slice.length
  })
}

/**
 * Compute descriptive statistics for an array of numbers.
 */
export function computeStats(values) {
  if (!values.length) return null

  const count = values.length
  const sum   = values.reduce((s, v) => s + v, 0)
  const mean  = sum / count
  const min   = Math.min(...values)
  const max   = Math.max(...values)
  const range = max - min

  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / count
  const stdDev   = Math.sqrt(variance)

  return { count, sum, mean, min, max, range, stdDev }
}
