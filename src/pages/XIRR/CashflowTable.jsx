import React, { useRef } from 'react'
import styles from './CashflowTable.module.css'

function AmountBadge({ value }) {
  const num = parseFloat(value)
  if (isNaN(num) || value === '' || value === '-') return null
  return (
    <span className={num >= 0 ? styles.badgeIn : styles.badgeOut}>
      {num >= 0 ? '↑ Inflow' : '↓ Outflow'}
    </span>
  )
}

export default function CashflowTable({ rows, onUpdate, onRemove }) {
  return (
    <div className={styles.tableWrapper}>
      {/* Desktop table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.thNum}>#</th>
            <th>Date</th>
            <th>Amount (₹ / $)</th>
            <th>Type</th>
            <th className={styles.thAction}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id} className={styles.row}>
              <td className={styles.tdNum}>{idx + 1}</td>
              <td>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={row.date}
                  onChange={e => onUpdate(row.id, 'date', e.target.value)}
                  aria-label={`Date for row ${idx + 1}`}
                />
              </td>
              <td>
                <input
                  className={[
                    styles.input,
                    parseFloat(row.amount) > 0 ? styles.inputIn :
                    parseFloat(row.amount) < 0 ? styles.inputOut : ''
                  ].join(' ')}
                  type="number"
                  placeholder="e.g. -10000"
                  value={row.amount}
                  onChange={e => onUpdate(row.id, 'amount', e.target.value)}
                  aria-label={`Amount for row ${idx + 1}`}
                />
              </td>
              <td>
                <AmountBadge value={row.amount} />
              </td>
              <td className={styles.tdAction}>
                <button
                  className={styles.removeBtn}
                  onClick={() => onRemove(row.id)}
                  disabled={rows.length <= 2}
                  aria-label={`Remove row ${idx + 1}`}
                  title="Remove row"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile cards */}
      <div className={styles.mobileCards}>
        {rows.map((row, idx) => (
          <div key={row.id} className={styles.mobileCard}>
            <div className={styles.mobileCardHeader}>
              <span className={styles.mobileRowNum}>Row {idx + 1}</span>
              <AmountBadge value={row.amount} />
              <button
                className={styles.removeBtn}
                onClick={() => onRemove(row.id)}
                disabled={rows.length <= 2}
              >×</button>
            </div>
            <div className={styles.mobileFields}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Date</label>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={row.date}
                  onChange={e => onUpdate(row.id, 'date', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Amount</label>
                <input
                  className={[
                    styles.input,
                    parseFloat(row.amount) > 0 ? styles.inputIn :
                    parseFloat(row.amount) < 0 ? styles.inputOut : ''
                  ].join(' ')}
                  type="number"
                  placeholder="e.g. -10000"
                  value={row.amount}
                  onChange={e => onUpdate(row.id, 'amount', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
