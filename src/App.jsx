import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import XIRRPage from './pages/XIRR/XIRRPage'
import AverageChartPage from './pages/AverageChart/AverageChartPage'
import HomePage from './pages/Home/HomePage'

// Route registry — add new pages here
export const NAV_ROUTES = [
  {
    path: '/xirr',
    label: 'XIRR Calculator',
    icon: 'xirr',
    element: <XIRRPage />,
  },
  {
    path: '/avg-chart',
    label: 'Average Chart',
    icon: 'avgChart',
    element: <AverageChartPage />,
  },
]

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {NAV_ROUTES.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  )
}
