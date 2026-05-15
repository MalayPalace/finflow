import React from 'react'
import { useLocation } from 'react-router-dom'
import { NAV_ROUTES } from '../../App'
import NavIcon from '../ui/NavIcon'
import styles from './TopBar.module.css'

export default function TopBar({ onMobileMenuOpen }) {
  const location = useLocation()
  const current = NAV_ROUTES.find(r => r.path === location.pathname)

  return (
    <header className={styles.topbar}>
      <button
        className={styles.menuBtn}
        onClick={onMobileMenuOpen}
        aria-label="Open menu"
      >
        <NavIcon name="menu" size={20} />
      </button>
      <div className={styles.breadcrumb}>
        <span className={styles.breadHome}>FinFlow</span>
        {current && (
          <>
            <span className={styles.sep}>/</span>
            <span className={styles.breadCurrent}>{current.label}</span>
          </>
        )}
      </div>
      <div className={styles.right}>
        <div className={styles.badge}>Beta</div>
      </div>
    </header>
  )
}
