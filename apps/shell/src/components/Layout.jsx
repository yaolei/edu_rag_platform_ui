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

      {/* 主内容区：使用 calc 精确计算高度，避免溢出 */}
      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          height: 'calc(100vh - 64px)', // 减去 AppBar 高度
          pt: 2,
          px: 3,
          pb: 2,
          overflow: 'hidden', // 禁止主区域滚动
          display: 'flex',
          flexDirection: 'column',
          marginTop: '9vh',
        }}
      >
        {children}
      </Box>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  )
}