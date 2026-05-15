import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import XIRRPage from './pages/XIRR/XIRRPage'

// Route registry — add new pages here
export const NAV_ROUTES = [
  {
    path: '/xirr',
    label: 'XIRR Calculator',
    icon: 'xirr',
    element: <XIRRPage />,
  },
  // Example of how to add future routes:
  // { path: '/portfolio', label: 'Portfolio', icon: 'portfolio', element: <PortfolioPage /> },
  // { path: '/sip',       label: 'SIP Planner', icon: 'sip',       element: <SIPPage /> },
]

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/xirr" replace />} />
        {NAV_ROUTES.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        <Route path="*" element={<Navigate to="/xirr" replace />} />
      </Routes>
    </AppLayout>
  )
}
