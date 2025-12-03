import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { ErrorBoundary } from '@workspace/shared-util'
import { Layout } from './components/Layout'
import { createRoutes } from './config/routes'
import { getTheme } from './config/theme'

function AppContent() {
  const [errorKey, setErrorKey] = useState('root')
  const location = useLocation()
  const navigate = useNavigate()
  const { currentMode } = useTheme()

  // 每当路由改变时，更新 errorKey
  useEffect(() => {
    setErrorKey(`error-${location.pathname}-${Date.now()}`)
  }, [location.pathname])

  const routes = createRoutes(navigate)

  return (
    <MuiThemeProvider theme={getTheme(currentMode)}>
      <CssBaseline />
      <ErrorBoundary key={errorKey}>
        <Layout>
          <Routes>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </Layout>
      </ErrorBoundary>
    </MuiThemeProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App