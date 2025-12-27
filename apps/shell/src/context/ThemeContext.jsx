import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    // 从 localStorage 读取主题，默认为 'dark'
    return localStorage.getItem('themeMode') || 'dark'
  })

  const [systemMode, setSystemMode] = useState(() => {
    // 检测系统主题偏好
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  })

  useEffect(() => {
    // 监听系统主题变化
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      setSystemMode(e.matches ? 'dark' : 'light')
    }

    darkModeQuery.addEventListener('change', handleChange)
    return () => darkModeQuery.removeEventListener('change', handleChange)
  }, [])

  const getCurrentMode = () => {
    if (themeMode === 'system') {
      return systemMode
    }
    return themeMode
  }

  const handleThemeChange = (mode) => {
    setThemeMode(mode)
    localStorage.setItem('themeMode', mode)
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        currentMode: getCurrentMode(),
        systemMode,
        setThemeMode: handleThemeChange
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}