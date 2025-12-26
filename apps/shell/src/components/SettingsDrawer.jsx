import React from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'


import CloseIcon from '@mui/icons-material/Close'
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useTheme } from '../context/ThemeContext'

export function SettingsDrawer({ open, onClose }) {
  const { themeMode, setThemeMode } = useTheme()

  const options = [
    { value: 'light', label: 'Light', Icon: LightModeIcon },
    { value: 'dark', label: 'Dark', Icon: DarkModeIcon }
  ]

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          display: 'flex',
          flexDirection: 'column',
          // 保证 Drawer 自身不引起页面滚动，内部可滚动
          overflow: 'hidden',
          transition: 'width 300ms cubic-bezier(0.4,0,0.2,1)'
        },
        className: 'bg-white dark:bg-gray-800'
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>Settings</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon /></IconButton>
      </Box>

      {/* 内容区：允许内部滚动但不超过 Drawer 高度 */}
      <Box sx={{ p: 2, overflowY: 'auto' }}>
        <Typography sx={{ mb: 2, fontWeight: 500 }}>Theme</Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {options.map(({ value, label, Icon }) => {
            const active = themeMode === value
            return (
              <button
                key={value}
                onClick={() => setThemeMode(value)}
                aria-pressed={active}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'transform 200ms cubic-bezier(0.4,0,0.2,1), box-shadow 200ms',
                  background: active ? undefined : undefined
                }}
                className={active ? 'active-theme-btn' : 'inactive-theme-btn'}
              >
                <Box component={Icon} sx={{ mr: 0, color: active ? 'white' : 'inherit' }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: active ? undefined : undefined }}>{label}</span>
              </button>
            )
          })}
        </Box>

        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary' }}>
            The theme will take effect immediately after being changed
        </Typography>
      </Box>

      {/* 底部占位避免滚动条出现（屏幕较小时内部滚动） */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">More settings will be added gradually.</Typography>
      </Box>

      {/* 局部样式（用于 active/inactive） */}
      <style>{`
        .active-theme-btn {
          background: var(--mui-palette-primary-main, #1976d2);
          color: white;
          box-shadow: 0 6px 18px rgba(25,118,210,0.16);
          transform: translateY(-2px) scale(1.02);
        }
        .inactive-theme-btn {
          background: rgba(0,0,0,0.03);
        }
        .inactive-theme-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
        }
      `}</style>
    </Drawer>
  )
}