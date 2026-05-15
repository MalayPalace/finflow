import React from 'react'
import styles from './SummaryStats.module.css'

function fmt(n) {
  if (!n && n !== 0) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.abs(n))
}

export default function SummaryStats({ stats }) {
  return (
    <div className={styles.grid}>
      <div className={styles.stat}>
        <p className={styles.label}>Cashflow Rows</p>
        <p className={styles.value}>{stats.count}</p>
      </div>
      <div className={styles.stat}>
        <p className={styles.label}>Total Invested</p>
        <p className={[styles.value, styles.out].join(' ')}>{fmt(stats.totalOut)}</p>
      </div>
      <div className={styles.stat}>
        <p className={styles.label}>Total Received</p>
        <p className={[styles.value, styles.in].join(' ')}>{fmt(stats.totalIn)}</p>
      </div>
      <div className={styles.stat}>
        <p className={styles.label}>Net Gain / Loss</p>
        <p className={[styles.value, stats.netFlow >= 0 ? styles.in : styles.out].join(' ')}>
          {stats.netFlow >= 0 ? '+' : '-'}{fmt(stats.netFlow)}
        </p>
      </div>
    </div>
  )
}
