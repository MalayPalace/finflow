import React from 'react'
import { Link } from 'react-router-dom'
import styles from './HomePage.module.css'

export default function HomePage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Welcome to FinFlow</h1>
        <p className={styles.subtitle}>
          Your unified toolkit for advanced investment analytics and financial modelling.
        </p>
      </div>
      
      <div className={styles.features}>
        <Link to="/xirr" className={styles.card}>
          <div className={styles.cardIcon}>📊</div>
          <h2 className={styles.cardTitle}>XIRR Calculator</h2>
          <p className={styles.cardDesc}>
            Calculate the Extended Internal Rate of Return for a series of irregular cash flows.
          </p>
        </Link>
        
        <Link to="/avg-chart" className={styles.card}>
          <div className={styles.cardIcon}>📈</div>
          <h2 className={styles.cardTitle}>Average Chart</h2>
          <p className={styles.cardDesc}>
            Visualise numeric series, overall averages, moving averages, and YOY growth.
          </p>
        </Link>
      </div>
    </div>
  )
}
