import { useState, useCallback, useMemo } from 'react'
import { calculateXIRR, parseDate, validateCashflows, formatPercent } from '../utils/xirr'

const EMPTY_ROW = () => ({ id: crypto.randomUUID(), date: '', amount: '' })

const DEFAULT_ROWS = [
  { id: crypto.randomUUID(), date: '2023-01-01', amount: '-100000' },
  { id: crypto.randomUUID(), date: '2023-07-01', amount: '-50000' },
  { id: crypto.randomUUID(), date: '2024-01-01', amount: '180000' },
]

export function useXIRR() {
  const [rows, setRows] = useState(DEFAULT_ROWS)
  const [result, setResult] = useState(null)
  const [errors, setErrors] = useState([])
  const [calculated, setCalculated] = useState(false)

  const updateRow = useCallback((id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
    setCalculated(false)
    setErrors([])
  }, [])

  const addRow = useCallback(() => {
    setRows(prev => [...prev, EMPTY_ROW()])
  }, [])

  const removeRow = useCallback((id) => {
    setRows(prev => prev.length > 2 ? prev.filter(r => r.id !== id) : prev)
  }, [])

  const clearAll = useCallback(() => {
    setRows([EMPTY_ROW(), EMPTY_ROW()])
    setResult(null)
    setErrors([])
    setCalculated(false)
  }, [])

  const loadExample = useCallback(() => {
    setRows(DEFAULT_ROWS.map(r => ({ ...r, id: crypto.randomUUID() })))
    setResult(null)
    setErrors([])
    setCalculated(false)
  }, [])

  const calculate = useCallback(() => {
    const filledRows = rows.filter(r => r.date.trim() && r.amount.trim())

    const validation = validateCashflows(filledRows)
    if (!validation.valid) {
      setErrors(validation.errors)
      setResult(null)
      setCalculated(false)
      return
    }

    const cashflows = filledRows
      .map(r => ({ date: parseDate(r.date), amount: parseFloat(r.amount) }))
      .sort((a, b) => a.date - b.date)

    const rate = calculateXIRR(cashflows)
    setResult(rate)
    setErrors([])
    setCalculated(true)
  }, [rows])

  // Summary stats
  const stats = useMemo(() => {
    const filled = rows.filter(r => r.date.trim() && r.amount.trim())
    const totalIn  = filled.filter(r => parseFloat(r.amount) > 0).reduce((s, r) => s + parseFloat(r.amount), 0)
    const totalOut = filled.filter(r => parseFloat(r.amount) < 0).reduce((s, r) => s + parseFloat(r.amount), 0)
    return {
      count: filled.length,
      totalIn,
      totalOut,
      netFlow: totalIn + totalOut,
    }
  }, [rows])

  return {
    rows, result, errors, calculated, stats,
    updateRow, addRow, removeRow, clearAll, loadExample, calculate,
    formattedResult: formatPercent(result),
  }
}
