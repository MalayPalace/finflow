import React, { useRef } from 'react'
import { useXIRR } from '../../hooks/useXIRR'
import CashflowTable from './CashflowTable'
import ResultCard from './ResultCard'
import SummaryStats from './SummaryStats'
import { saveElementAsImage } from '../../utils/saveAsImage'
import styles from './XIRRPage.module.css'

export default function XIRRPage() {
  const xirr = useXIRR()
  const captureRef = useRef(null)

  const handleSave = async () => {
    if (captureRef.current) {
      await saveElementAsImage(captureRef.current, 'xirr')
    }
  }

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>XIRR Calculator</h1>
          <p className={styles.subtitle}>
            Compute the annualised return on irregular cashflows using Extended IRR.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.btnSave}
            onClick={handleSave}
            disabled={!xirr.calculated}
            title="Download XIRR result as image"
          >
            💾 Save
          </button>
          <button className={styles.btnSecondary} onClick={xirr.loadExample}>
            Load Example
          </button>
          <button className={styles.btnGhost} onClick={xirr.clearAll}>
            Clear All
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div ref={captureRef} className={styles.captureContainer}>
        <SummaryStats stats={xirr.stats} />

        {/* Result */}
        {(xirr.calculated || xirr.errors.length > 0) && (
          <ResultCard
            result={xirr.result}
            formatted={xirr.formattedResult}
            errors={xirr.errors}
          />
        )}

        {/* Cashflows section */}
        <div className={styles.captureCard}>
          <div className={styles.captureCardHeader}>
            <div>
              <h2 className={styles.captureCardTitle}>Cashflows</h2>
              <p className={styles.cardHint}>
                Use negative amounts for investments (outflows) and positive for returns (inflows).
                Supported date formats: <code>YYYY-MM-DD</code>, <code>DD/MM/YYYY</code>
              </p>
            </div>
            <button className={styles.btnAdd} onClick={xirr.addRow} title="Add row">
              <span>+</span> Add Row
            </button>
          </div>

          <CashflowTable
            rows={xirr.rows}
            onUpdate={xirr.updateRow}
            onRemove={xirr.removeRow}
          />

          <div className={styles.actions}>
            <button className={styles.btnCalculate} onClick={xirr.calculate}>
              <span className={styles.btnCalcIcon}>⟳</span>
              Calculate XIRR
            </button>
          </div>
        </div>
      </div>

      {/* Info box */}
      <details className={styles.infoBox}>
        <summary className={styles.infoSummary}>How does XIRR work?</summary>
        <div className={styles.infoBody}>
          <p>
            XIRR (Extended Internal Rate of Return) computes the annualised yield that sets the
            Net Present Value of a series of cashflows to zero. Unlike IRR, XIRR handles{' '}
            <strong>irregular time intervals</strong> between cashflows.
          </p>
          <ul>
            <li>Enter <strong>negative</strong> values for money invested (outflows).</li>
            <li>Enter <strong>positive</strong> values for money received (inflows).</li>
            <li>You need at least one of each.</li>
            <li>Dates can be in any order — they will be sorted internally.</li>
          </ul>
        </div>
      </details>
    </div>
  )
}
