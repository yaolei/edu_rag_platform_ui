import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { ErrorBoundary } from '@workspace/shared-util'
import { Layout } from './components/Layout'
import { createRoutes } from './config/routes'
import { getTheme } from './config/theme'
import Login from './pages/Login'

function AppContent() {
  const [errorKey, setErrorKey] = useState('root')
  const location = useLocation()
  const navigate = useNavigate()
  const { currentMode } = useTheme()

  useEffect(() => {
    setErrorKey(`error-${location.pathname}-${Date.now()}`)
  }, [location.pathname])

  const routes = createRoutes(navigate)

  return (
    <MuiThemeProvider theme={getTheme(currentMode)}>
      <CssBaseline />
      <ErrorBoundary key={errorKey}>
          <Routes>
          <Route path='/login' element={<Login />} />
          <Route element={<Layout />}>
            {routes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>
          </Routes>
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