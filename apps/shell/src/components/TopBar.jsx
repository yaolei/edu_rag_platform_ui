import React, { useState } from 'react'
import { AppBar, Toolbar, IconButton, Typography, Box, Menu, MenuItem } from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SettingsIcon from '@mui/icons-material/Settings'

export function TopBar({ onOpenSettings }) {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  return (
    <AppBar position="fixed" elevation={1} sx={{ zIndex: (t) => t.zIndex.drawer + 2 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
          <Box component="img" src="/rag.png" alt="RAG" sx={{ height: 36, width: 36 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Edu RAG Platform
          </Typography>
        </Box>

        <Box>
          <IconButton color="inherit" onClick={onOpenSettings} aria-label="settings">
            <SettingsIcon />
          </IconButton>

          <IconButton color="inherit" onClick={handleMenuOpen} aria-label="account">
            <AccountCircleIcon sx={{ fontSize: 32 }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}