import React, { useMemo } from 'react'
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
import { Line } from 'react-chartjs-2'
import styles from './AverageChart.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)

const COLORS = {
  raw:      'rgba(46, 125, 85, 1)',   // Using green for growth
  rawFill:  'rgba(46, 125, 85, 0.12)',
  ma:       'rgba(200, 137, 42, 1)',  // Using gold for moving average
}

function fmtPercent(n) {
  if (n === null || n === undefined) return '—'
  return (n * 100).toLocaleString(undefined, { maximumFractionDigits: 2 }) + '%'
}

export default function GrowthChart({ values, maWindow }) {
  const hasData = values && values.length >= 2

  // Calculate YOY Growth
  // YOY[i] = (values[i] - values[i-1]) / |values[i-1]|
  // For the first data point (i=0), we assume YOY = average value as per user request.
  // Wait, the user said "For first datapoint assume the single value as the average value."
  // Oh! I asked: "For the YOY Growth calculation, the chart will have one fewer data point than the raw data... Is this acceptable?"
  // User replied: "Yes that is fine. For first datapoint assume the single value as the average value."
  // That means for the moving average of the first data point (which is the only point in the window), it's just itself. Since we are doing MA of YOY Growth, if the YOY Growth array starts from index 1, its first MA point will be just that point. I'll construct the YOY growth array with N-1 elements.
  
  const { growthValues, maValues } = useMemo(() => {
    if (!hasData) return { growthValues: [], maValues: [] }
    
    const yoy = []
    for (let i = 1; i < values.length; i++) {
      const prev = values[i - 1]
      const curr = values[i]
      if (prev === 0) {
        yoy.push(0) // Avoid division by zero
      } else {
        yoy.push((curr - prev) / Math.abs(prev))
      }
    }

    const ma = []
    for (let i = 0; i < yoy.length; i++) {
      const windowStart = Math.max(0, i - maWindow + 1)
      const windowSlice = yoy.slice(windowStart, i + 1)
      const sum = windowSlice.reduce((a, b) => a + b, 0)
      ma.push(sum / windowSlice.length)
    }

    return { growthValues: yoy, maValues: ma }
  }, [values, maWindow])

  const labels = hasData ? values.slice(1).map((_, i) => i + 2) : []

  const data = {
    labels,
    datasets: [
      {
        label: 'YOY Growth',
        data: growthValues,
        borderColor: COLORS.raw,
        backgroundColor: COLORS.rawFill,
        borderWidth: 2,
        pointStyle: 'rect', // Square marker
        pointRadius: growthValues.length > 80 ? 0 : growthValues.length > 30 ? 3 : 5,
        pointHoverRadius: 7,
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
        pointStyle: 'rect', // Square marker
        pointRadius: growthValues.length > 80 ? 0 : growthValues.length > 30 ? 2 : 4,
        pointHoverRadius: 6,
        pointBackgroundColor: COLORS.ma,
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
          pointStyle: 'rect',
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
          label: (context) => {
             let label = context.dataset.label || '';
             if (label) {
                 label += ': ';
             }
             if (context.parsed.y !== null) {
                 label += fmtPercent(context.parsed.y);
             }
             return label;
          }
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
          callback: v => fmtPercent(v),
        },
        grid: { color: 'rgba(226, 221, 215, 0.5)' },
      },
    },
  }

  return (
    <div className={styles.chartCard} style={{ marginTop: '24px' }}>
      {/* Header */}
      <div className={styles.chartHeader}>
        <div>
          <p className={styles.chartTitle}>YOY Growth Series</p>
          <p className={styles.chartSubtitle}>{growthValues.length} data points · MA window = {maWindow}</p>
        </div>
        {/* Legend explanation */}
        <div className={styles.legendRow}>
          <div className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: COLORS.raw, borderRadius: '2px' }} />
            <span>YOY Growth</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendLine} style={{ background: COLORS.ma, borderRadius: '2px' }} />
            <span>Moving avg</span>
          </div>
        </div>
      </div>

      {/* Chart body */}
      <div className={styles.chartBody} style={{ height: 420 }}>
        {hasData ? (
          <Line data={data} options={options} />
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📈</span>
            <span className={styles.emptyText}>Need at least 2 points for YOY Growth</span>
          </div>
        )}
      </div>
    </div>
  )
}
