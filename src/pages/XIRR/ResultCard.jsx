import React from 'react'
import styles from './ResultCard.module.css'

export default function ResultCard({ result, formatted, errors }) {
  if (errors && errors.length > 0) {
    return (
      <div className={styles.errorCard}>
        <div className={styles.errorIcon}>⚠</div>
        <div>
          <p className={styles.errorTitle}>Could not calculate XIRR</p>
          <ul className={styles.errorList}>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      </div>
    )
  }

  if (result === null) {
    return (
      <div className={styles.errorCard}>
        <div className={styles.errorIcon}>⚠</div>
        <div>
          <p className={styles.errorTitle}>No convergence</p>
          <p className={styles.errorSub}>The XIRR algorithm did not converge. Try adjusting your cashflows.</p>
        </div>
      </div>
    )
  }

  const isPositive = result >= 0
  const rateClass = result > 0.15 ? styles.great : result > 0 ? styles.good : styles.bad

  return (
    <div className={[styles.resultCard, rateClass].join(' ')}>
      <div className={styles.resultLeft}>
        <p className={styles.resultLabel}>Annualised XIRR</p>
        <p className={styles.resultValue}>{formatted}</p>
        <p className={styles.resultSub}>
          {isPositive
            ? result > 0.15
              ? '🚀 Excellent return on your investment'
              : '✓ Positive return on your investment'
            : '↓ Negative return — loss on investment'}
        </p>
      </div>
      <div className={styles.resultGauge}>
        <svg viewBox="0 0 120 70" className={styles.gaugeSvg}>
          <path d="M10 60 A50 50 0 0 1 110 60" fill="none" stroke="#e2ddd7" strokeWidth="10" strokeLinecap="round" />
          <path
            d="M10 60 A50 50 0 0 1 110 60"
            fill="none"
            stroke={result > 0.15 ? '#2e7d55' : result > 0 ? '#c8892a' : '#c0392b'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="157"
            strokeDashoffset={Math.max(0, 157 - Math.min(1, Math.max(-0.2, result + 0.2) / 0.6) * 157)}
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)' }}
          />
          <text x="60" y="58" textAnchor="middle" fontSize="13" fontWeight="700"
            fill={result > 0.15 ? '#2e7d55' : result > 0 ? '#9e6a18' : '#c0392b'}
            fontFamily="DM Sans, sans-serif">
            {formatted}
          </text>
        </svg>
      </div>
    </div>
  )
}
