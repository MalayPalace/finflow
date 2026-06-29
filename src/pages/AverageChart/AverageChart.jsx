import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { Line } from 'react-chartjs-2'
import styles from './AverageChart.module.css'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  annotationPlugin,
)

const COLORS = {
  raw:      'rgba(200, 137, 42, 1)',
  rawFill:  'rgba(200, 137, 42, 0.12)',
  ma:       'rgba(46, 125, 85, 1)',
  avg:      'rgba(90, 90, 200, 0.8)',
}

function fmtNum(n) {
  if (n === null || n === undefined) return '—'
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

export default function AverageChart({ values, maValues, average, maWindow }) {
  const hasData = values && values.length >= 2

  const labels = hasData ? values.map((_, i) => i + 1) : []

  const data = {
    labels,
    datasets: [
      {
        label: 'Value',
        data: values,
        borderColor: COLORS.raw,
        backgroundColor: COLORS.rawFill,
        borderWidth: 2,
        pointRadius: values.length > 80 ? 0 : values.length > 30 ? 2 : 4,
        pointHoverRadius: 6,
        pointBackgroundColor: COLORS.raw,
        fill: true,
        tension: 0.3,
        order: 2,
      },
      {
        label: `Moving Avg (window=${maWindow})`,
        data: maValues,
        borderColor: COLORS.ma,
        backgroundColor: 'transparent',
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        fill: false,
        tension: 0.4,
        order: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          boxWidth: 14,
          boxHeight: 14,
          padding: 16,
          font: { family: "'DM Sans', system-ui, sans-serif", size: 12 },
          color: '#4a453f',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 27, 23, 0.92)',
        titleFont: { family: "'DM Sans', system-ui, sans-serif", size: 12 },
        bodyFont:  { family: "'DM Sans', system-ui, sans-serif", size: 12 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          title: ctx => `#${ctx[0].label}`,
          afterBody: () => [`─────────────`, `Overall avg: ${fmtNum(average)}`],
        },
      },
      annotation: {
        annotations: {
          avgLine: {
            type: 'line',
            yMin: average,
            yMax: average,
            borderColor: COLORS.avg,
            borderWidth: 1.5,
            borderDash: [6, 4],
            label: {
              display: true,
              content: `Avg: ${fmtNum(average)}`,
              position: 'end',
              backgroundColor: 'rgba(90, 90, 200, 0.12)',
              color: 'rgba(60,60,160,0.9)',
              font: { size: 11, family: "'DM Sans', system-ui, sans-serif", weight: '600' },
              padding: { x: 8, y: 4 },
              borderRadius: 4,
            },
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 20,
          font: { family: "'DM Sans', system-ui, sans-serif", size: 11 },
          color: '#8a837a',
        },
        grid: { color: 'rgba(226, 221, 215, 0.5)' },
        title: {
          display: true,
          text: 'Index',
          color: '#8a837a',
          font: { size: 11 },
        },
      },
      y: {
        ticks: {
          font: { family: "'DM Sans', system-ui, sans-serif", size: 11 },
          color: '#8a837a',
          callback: v => fmtNum(v),
        },
        grid: { color: 'rgba(226, 221, 215, 0.5)' },
      },
    },
  }

  return (
    <div className={styles.chartCard}>
      {/* Header */}
      <div className={styles.chartHeader}>
        <div>
          <p className={styles.chartTitle}>Value Series</p>
          <p className={styles.chartSubtitle}>{values.length} data points · MA window = {maWindow}</p>
        </div>
        {/* Legend explanation */}
        <div className={styles.legendRow}>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: COLORS.raw }} />
            <span>Value</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendLine} style={{ background: COLORS.ma }} />
            <span>Moving avg</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendDash} style={{ borderColor: COLORS.avg }} />
            <span>Overall avg</span>
          </div>
        </div>
      </div>

      {/* Chart body */}
      <div className={styles.chartBody} style={{ height: 420 }}>
        {hasData ? (
          <Line data={data} options={options} />
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📊</span>
            <span className={styles.emptyText}>Plot a series to see the chart</span>
          </div>
        )}
      </div>
    </div>
  )
}
