import React from 'react'
import { NavLink } from 'react-router-dom'
import { NAV_ROUTES } from '../../App'
import NavIcon from '../ui/NavIcon'
import styles from './Sidebar.module.css'

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className={styles.backdrop} onClick={onMobileClose} />
      )}

      <aside
        className={[
          styles.sidebar,
          collapsed ? styles.collapsed : '',
          mobileOpen ? styles.mobileOpen : '',
        ].join(' ')}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            <NavIcon name="logo" size={30} />
            {!collapsed && (
              <span className={styles.brandName}>FinFlow</span>
            )}
          </div>
          <button
            className={styles.collapseBtn}
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <NavIcon name={collapsed ? 'menu' : 'chevronLeft'} size={18} />
          </button>
        </div>

        {/* Section label */}
        {!collapsed && (
          <p className={styles.sectionLabel}>Tools</p>
        )}

        {/* Nav items */}
        <nav className={styles.nav}>
          {NAV_ROUTES.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                [styles.navItem, isActive ? styles.active : ''].join(' ')
              }
              onClick={mobileOpen ? onMobileClose : undefined}
              title={collapsed ? label : undefined}
            >
              <span className={styles.iconWrap}>
                <NavIcon name={icon} size={19} />
              </span>
              {!collapsed && <span className={styles.navLabel}>{label}</span>}
              {!collapsed && <span className={styles.navArrow}>›</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          {!collapsed && (
            <p className={styles.footerText}>FinFlow v1.0</p>
          )}
        </div>
      </aside>
    </>
  )
}
