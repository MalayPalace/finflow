import React from 'react'
import styles from './StatsStrip.module.css'

function fmt(n) {
  if (n === null || n === undefined) return '—'
  // Show at most 4 significant figures, use compact notation for large numbers
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (abs >= 1_000)     return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
  return n.toLocaleString(undefined, { maximumSignificantDigits: 5 })
}

export default function StatsStrip({ stats }) {
  if (!stats) return null
  const { count, mean, min, max, range, stdDev } = stats

  const items = [
    { label: 'Count',   value: count,            cls: ''        },
    { label: 'Mean',    value: fmt(mean),         cls: 'accent'  },
    { label: 'Min',     value: fmt(min),           cls: 'danger'  },
    { label: 'Max',     value: fmt(max),           cls: 'success' },
    { label: 'Range',   value: fmt(range),         cls: ''        },
    { label: 'Std Dev', value: fmt(stdDev),        cls: ''        },
  ]

  return (
    <div className={styles.strip}>
      {items.map(({ label, value, cls }) => (
        <div key={label} className={styles.stat}>
          <span className={styles.statLabel}>{label}</span>
          <span className={[styles.statValue, cls ? styles[cls] : ''].join(' ')}>{value}</span>
        </div>
      ))}
    </div>
  )
}
