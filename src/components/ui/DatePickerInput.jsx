import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styles from './DatePickerInput.module.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const today = () => {
  const d = new Date()
  return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() }
}

const todayStr = () => {
  const d = new Date()
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

/** Parse a YYYY-MM-DD string → { y, m, d } or null */
function parseISO(str) {
  if (!str) return null
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const y = +m[1], mo = +m[2] - 1, d = +m[3]
  const dt = new Date(y, mo, d)
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null
  return { y, m: mo, d }
}

/** Parse multiple common date formats; return YYYY-MM-DD or null */
function normaliseDate(str) {
  str = str.trim()
  if (!str) return null

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const p = parseISO(str)
    return p ? str : null
  }
  // DD/MM/YYYY  or  DD-MM-YYYY
  const dm = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (dm) {
    const iso = `${dm[3]}-${dm[2].padStart(2, '0')}-${dm[1].padStart(2, '0')}`
    return parseISO(iso) ? iso : null
  }
  // MM/DD/YYYY
  const md = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (md) {
    const iso = `${md[3]}-${md[1].padStart(2, '0')}-${md[2].padStart(2, '0')}`
    return parseISO(iso) ? iso : null
  }
  return null
}

function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate()
}

function firstWeekday(y, m) {
  return new Date(y, m, 1).getDay() // 0=Sun
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const YEAR_RANGE = (() => {
  const y = new Date().getFullYear()
  const arr = []
  for (let i = y - 30; i <= y + 10; i++) arr.push(i)
  return arr
})()

// ─── Portal Calendar ──────────────────────────────────────────────────────────
// Renders into document.body so it escapes any overflow:hidden/auto ancestors.

function CalendarPortal({ anchorRef, onClose, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const calRef = useRef(null)

  // Compute position relative to viewport (fixed positioning)
  const reposition = useCallback(() => {
    if (!anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    const calH = calRef.current?.offsetHeight ?? 320
    const calW = 270
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top

    let top
    if (spaceBelow >= calH || spaceBelow >= spaceAbove) {
      // Open downward
      top = rect.bottom + 6
    } else {
      // Flip upward
      top = rect.top - calH - 6
    }

    // Prevent clipping off right edge
    let left = rect.left
    if (left + calW > window.innerWidth - 8) {
      left = window.innerWidth - calW - 8
    }

    setPos({ top, left, width: rect.width })
  }, [anchorRef])

  useEffect(() => {
    reposition()
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [reposition])

  // Close on outside click — must check both the anchor AND the calendar
  useEffect(() => {
    const handler = (e) => {
      if (
        calRef.current && !calRef.current.contains(e.target) &&
        anchorRef.current && !anchorRef.current.contains(e.target)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [anchorRef, onClose])

  return createPortal(
    <div
      ref={calRef}
      className={styles.calendar}
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 99999 }}
      role="dialog"
      aria-label="Date picker calendar"
    >
      {children}
    </div>,
    document.body
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DatePickerInput({ value, onChange, id, ariaLabel }) {
  const [text, setText] = useState(value || todayStr())
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const initParsed = parseISO(value || todayStr()) || today()
  const [viewY, setViewY] = useState(initParsed.y)
  const [viewM, setViewM] = useState(initParsed.m)

  // anchorRef points to the input wrapper — used to position the portal calendar
  const anchorRef = useRef(null)
  const inputRef = useRef(null)
  const yearSelectRef = useRef(null)

  // Sync external value → text (when parent resets)
  useEffect(() => {
    setText(value || '')
    if (value) {
      const p = parseISO(value)
      if (p) { setViewY(p.y); setViewM(p.m) }
    }
  }, [value])

  // Scroll year select to current year when calendar opens
  useEffect(() => {
    if (open && yearSelectRef.current) {
      const sel = yearSelectRef.current
      const idx = YEAR_RANGE.indexOf(viewY)
      if (idx >= 0 && sel.options[idx]) sel.selectedIndex = idx
    }
  }, [open, viewY])

  // ── Text field handlers
  const handleTextChange = (e) => {
    const v = e.target.value
    setText(v)
    setError('')
    const iso = normaliseDate(v)
    if (iso) {
      const p = parseISO(iso)
      if (p) { setViewY(p.y); setViewM(p.m) }
      onChange(iso)
    }
  }

  const handleTextBlur = () => {
    if (!text.trim()) { setError(''); return }
    const iso = normaliseDate(text)
    if (!iso) {
      setError('Invalid date. Use YYYY-MM-DD or DD/MM/YYYY')
    } else {
      setError('')
      setText(iso)
      onChange(iso)
    }
  }

  // ── Calendar: select a day
  const selectDay = useCallback((d) => {
    const iso = `${viewY}-${String(viewM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    setText(iso)
    setError('')
    onChange(iso)
    setOpen(false)
    inputRef.current?.focus()
  }, [viewY, viewM, onChange])

  // ── Prev / next month
  const prevMonth = () => {
    if (viewM === 0) { setViewM(11); setViewY(y => y - 1) }
    else setViewM(m => m - 1)
  }
  const nextMonth = () => {
    if (viewM === 11) { setViewM(0); setViewY(y => y + 1) }
    else setViewM(m => m + 1)
  }

  const selectedParsed = parseISO(value || '')
  const isSelected = (d) =>
    selectedParsed &&
    selectedParsed.y === viewY &&
    selectedParsed.m === viewM &&
    selectedParsed.d === d

  const t = today()
  const isToday = (d) => t.y === viewY && t.m === viewM && t.d === d

  const numDays = daysInMonth(viewY, viewM)
  const startDay = firstWeekday(viewY, viewM)

  const handleTodayClick = () => {
    const iso = todayStr()
    const p = parseISO(iso)
    if (p) { setViewY(p.y); setViewM(p.m) }
    setText(iso)
    setError('')
    onChange(iso)
    setOpen(false)
  }

  return (
    <div className={styles.root} ref={anchorRef}>
      {/* Text input + calendar toggle */}
      <div className={`${styles.inputWrap} ${error ? styles.inputWrapError : ''}`}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          className={styles.textInput}
          value={text}
          placeholder="YYYY-MM-DD"
          aria-label={ariaLabel || 'Date'}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          onFocus={() => setError('')}
          autoComplete="off"
        />
        <button
          type="button"
          className={styles.calBtn}
          aria-label="Open calendar"
          tabIndex={-1}
          onClick={() => setOpen(o => !o)}
        >
          <CalIcon />
        </button>
      </div>

      {/* Inline error */}
      {error && (
        <p id={`${id}-error`} className={styles.errorMsg} role="alert">
          {error}
        </p>
      )}

      {/* Calendar rendered in a portal — escapes all overflow contexts */}
      {open && (
        <CalendarPortal anchorRef={anchorRef} onClose={() => setOpen(false)}>
          {/* Navigation header */}
          <div className={styles.calHeader}>
            <button type="button" className={styles.navBtn} onClick={prevMonth} aria-label="Previous month">‹</button>

            <div className={styles.calNavCenter}>
              <select
                className={styles.jumpSelect}
                value={viewM}
                onChange={e => setViewM(+e.target.value)}
                aria-label="Month"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={i}>{name}</option>
                ))}
              </select>

              <select
                ref={yearSelectRef}
                className={styles.jumpSelect}
                value={viewY}
                onChange={e => setViewY(+e.target.value)}
                aria-label="Year"
              >
                {YEAR_RANGE.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button type="button" className={styles.navBtn} onClick={nextMonth} aria-label="Next month">›</button>
          </div>

          {/* Day-of-week header */}
          <div className={styles.weekdays}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className={styles.weekday}>{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className={styles.days}>
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: numDays }).map((_, i) => {
              const d = i + 1
              return (
                <button
                  key={d}
                  type="button"
                  className={[
                    styles.day,
                    isSelected(d) ? styles.daySelected : '',
                    isToday(d) && !isSelected(d) ? styles.dayToday : '',
                  ].join(' ')}
                  onClick={() => selectDay(d)}
                  aria-label={`${d} ${MONTH_NAMES[viewM]} ${viewY}`}
                  aria-pressed={isSelected(d)}
                >
                  {d}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className={styles.calFooter}>
            <button type="button" className={styles.todayBtn} onClick={handleTodayClick}>
              Today
            </button>
          </div>
        </CalendarPortal>
      )}
    </div>
  )
}

function CalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}
