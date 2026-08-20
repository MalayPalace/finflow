import React, { useState, useMemo, useRef } from 'react'
import InputPanel from './InputPanel'
import AverageChart from './AverageChart'
import GrowthChart from './GrowthChart'
import StatsStrip from './StatsStrip'
import { parseInput, movingAverage, computeStats } from '../../utils/parseNumbers'
import { saveElementAsImage } from '../../utils/saveAsImage'
import styles from './AverageChartPage.module.css'

export default function AverageChartPage() {
  const [raw, setRaw]               = useState('')
  const [delimiterKey, setDelimiterKey] = useState('auto')
  const [maWindow, setMaWindow]     = useState(5)
  const [plotted, setPlotted]       = useState(false)
  const captureRef                  = useRef(null)

  // Live parse (for count + detected delimiter display)
  const { values: liveValues, detected, errors } = useMemo(
    () => parseInput(raw, delimiterKey),
    [raw, delimiterKey],
  )

  // Plotted data (committed on "Plot Chart" click)
  const [committedValues, setCommittedValues] = useState([])
  const [committedMaWindow, setCommittedMaWindow] = useState(5)

  const maValues = useMemo(
    () => movingAverage(committedValues, committedMaWindow),
    [committedValues, committedMaWindow],
  )

  const stats = useMemo(
    () => computeStats(committedValues),
    [committedValues],
  )

  const average = stats?.mean ?? null

  const handlePlot = () => {
    setCommittedValues(liveValues)
    setCommittedMaWindow(maWindow)
    setPlotted(true)
  }

  const handleClear = () => {
    setRaw('')
    setDelimiterKey('auto')
    setMaWindow(5)
    setPlotted(false)
    setCommittedValues([])
    setCommittedMaWindow(5)
  }

  const handleSave = async () => {
    if (captureRef.current) {
      await saveElementAsImage(captureRef.current, 'avg-chart')
    }
  }

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Average Chart</h1>
          <p className={styles.subtitle}>
            Paste a list of numbers or currency values to visualise the series,
            moving average and overall mean.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            id="avg-save-btn"
            className={styles.btnSave}
            onClick={handleSave}
            disabled={!plotted}
            title="Download chart as image"
          >
            💾 Save
          </button>
          <button className={styles.btnGhost} onClick={handleClear}>
            Clear All
          </button>
        </div>
      </div>

      {/* Capture region */}
      <div ref={captureRef} className={styles.captureContainer}>
        {/* Stats strip */}
        {plotted && <StatsStrip stats={stats} />}

        {/* Two-column layout */}
        <div className={styles.layout}>
          <InputPanel
            raw={raw}
            onRawChange={setRaw}
            delimiterKey={delimiterKey}
            onDelimiterChange={setDelimiterKey}
            detected={detected}
            parsedCount={liveValues.length}
            errors={errors}
            maWindow={maWindow}
            onMaWindowChange={setMaWindow}
            onPlot={handlePlot}
          />

          <div className={styles.chartsColumn}>
            <AverageChart
              values={committedValues}
              maValues={maValues}
              average={average}
              maWindow={committedMaWindow}
            />
            
            <GrowthChart
              values={committedValues}
              maWindow={committedMaWindow}
            />
          </div>
        </div>
      </div>

      {/* Info accordion */}
      <details className={styles.infoBox}>
        <summary className={styles.infoSummary}>How does this work?</summary>
        <div className={styles.infoBody}>
          <p>
            Paste any list of numbers — comma-separated, one-per-line, or any consistent delimiter.
            Currency symbols (₹, $, €, etc.) and thousand-separators are stripped automatically.
          </p>
          <ul>
            <li><strong>Auto-detect</strong> counts occurrences of each candidate delimiter and picks the most frequent one.</li>
            <li>Use the <strong>Override</strong> buttons to force a specific delimiter.</li>
            <li>The <strong>Moving Average</strong> uses a trailing window of the selected size.</li>
            <li>The dashed <strong>Overall Average</strong> line is the arithmetic mean of all values.</li>
            <li>Click <strong>Save</strong> to download the chart area as a JPG image.</li>
          </ul>
        </div>
      </details>
    </div>
  )
}
