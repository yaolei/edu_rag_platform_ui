// shell/components/Layout.jsx
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { SettingsDrawer } from './SettingsDrawer';

export function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleToggleSidebar = () => setSidebarCollapsed((s) => !s);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopBar onOpenSettings={() => setSettingsOpen(true)} />
      <Sidebar className="desktop-only" collapsed={sidebarCollapsed} onToggleCollapse={handleToggleSidebar} />

      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          height: 'calc(100vh - 64px)',
          pt: 2,
          px: 3,
          pb: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>

      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  );
}