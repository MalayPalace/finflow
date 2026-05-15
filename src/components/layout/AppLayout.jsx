import React, { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import styles from './AppLayout.module.css'

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className={styles.layout}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={styles.mainWrapper}>
        <TopBar onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className={styles.main}>
          <div className={styles.pageContent}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
