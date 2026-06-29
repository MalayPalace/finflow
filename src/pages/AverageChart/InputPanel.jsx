import React from 'react'
import { DELIMITER_OPTIONS } from '../../utils/parseNumbers'
import styles from './InputPanel.module.css'

const DELIMITER_LABELS = {
  newline:   'Newline (↵)',
  comma:     'Comma (,)',
  semicolon: 'Semicolon (;)',
  tab:       'Tab (⇥)',
  space:     'Space ( )',
}

export default function InputPanel({
  raw,
  onRawChange,
  delimiterKey,
  onDelimiterChange,
  detected,
  parsedCount,
  errors,
  maWindow,
  onMaWindowChange,
  onPlot,
}) {
  // Manual delimiter buttons (exclude 'auto' from toggle row)
  const manualOptions = DELIMITER_OPTIONS.filter(d => d.key !== 'auto')

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.panelHeader}>
        <p className={styles.panelTitle}>Data Input</p>
        <p className={styles.panelHint}>
          Paste numbers or currency values. Delimiters are detected automatically.
        </p>
      </div>

      <div className={styles.panelBody}>
        {/* Textarea */}
        <div className={styles.textareaWrap}>
          <textarea
            id="avg-data-input"
            className={styles.textarea}
            placeholder={`Paste values here, e.g.\n1,234.56\n2,500\n$3,000.00\n\nor: 100, 200, 300, 400`}
            value={raw}
            onChange={e => onRawChange(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Detected delimiter + count */}
        <div className={styles.detectedRow}>
          <span className={styles.detectedLabel}>Detected delimiter:</span>
          <span className={styles.detectedBadge}>
            {DELIMITER_LABELS[detected] ?? detected}
          </span>
          <span className={styles.parsedCount}>
            <span className={styles.parsedCountBold}>{parsedCount}</span> values parsed
          </span>
        </div>

        {/* Manual delimiter override */}
        <div className={styles.delimSection}>
          <span className={styles.delimSectionLabel}>Override delimiter</span>
          <div className={styles.delimButtons}>
            {manualOptions.map(opt => (
              <button
                key={opt.key}
                className={[
                  styles.delimBtn,
                  delimiterKey === opt.key ? styles.delimActive : '',
                ].join(' ')}
                onClick={() =>
                  onDelimiterChange(delimiterKey === opt.key ? 'auto' : opt.key)
                }
                title={delimiterKey === opt.key ? 'Click to reset to auto' : `Use ${opt.label} as delimiter`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Moving-average window slider (shown only when enough data) */}
        {parsedCount >= 3 && (
          <div className={styles.sliderSection}>
            <div className={styles.sliderHeader}>
              <span className={styles.sliderLabel}>Moving Average Window</span>
              <span className={styles.sliderValue}>{maWindow}</span>
            </div>
            <input
              id="ma-window-slider"
              type="range"
              min={2}
              max={Math.max(2, Math.min(50, Math.floor(parsedCount / 2)))}
              value={maWindow}
              onChange={e => onMaWindowChange(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
        )}

        {/* Parse errors */}
        {errors.length > 0 && (
          <div className={styles.errorList}>
            {errors.slice(0, 5).map((err, i) => (
              <span key={i} className={styles.errorItem}>{err}</span>
            ))}
            {errors.length > 5 && (
              <span className={styles.errorItem}>…and {errors.length - 5} more</span>
            )}
          </div>
        )}

        {/* Plot button */}
        <button
          id="avg-plot-btn"
          className={styles.plotBtn}
          onClick={onPlot}
          disabled={parsedCount < 2}
        >
          📈 Plot Chart
        </button>
      </div>
    </div>
  )
}
