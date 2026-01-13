import React, { useState } from 'react'
import { Box } from '@mui/material'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { SettingsDrawer } from './SettingsDrawer'

export function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const handleToggleSidebar = () => setSidebarCollapsed((s) => !s)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopBar onOpenSettings={() => setSettingsOpen(true)} />

      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          height: 'calc(100vh - 55px)',
          pt: 0,
          px: 0,
          pb: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          marginTop: '6vh',
        }}
      >
        {children}
      </Box>
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  )
}