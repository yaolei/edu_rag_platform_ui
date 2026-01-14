import React, { useState} from 'react'
import {useNavigate} from 'react-router'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import {navigationItems} from '../config/navigation'

import Dashboard from '@mui/icons-material/Dashboard';
import SmartToy from '@mui/icons-material/SmartToy';
import AutoStories from '@mui/icons-material/AutoStories';
import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings';
import {useSelector} from 'react-redux'

const iconMap = {
  Dashboard, // 对应 'Dashboard'
  SmartToy,       // 对应 'SmartToy'
  AutoStories,    // 对应 'AutoStories'
  AdminPanelSettings,   // 对应 'AdminPanelSettings'
};

export function TopBar({ onOpenSettings }) {
  const navigate = useNavigate()
  const currrentTopic = useSelector(state => state.chatTopics.chatTopiceValue)
  const [navAnchor, setNavAnchor] = useState(null);
  const theme = localStorage.getItem('themeMode') || 'dark';

  const handleNavOpen  = (e) => setNavAnchor(e.currentTarget);
  const handleNavClose = () => setNavAnchor(null);

  return (
    <AppBar position="fixed" elevation={1} sx={{ zIndex: (t) => t.zIndex.drawer + 2 }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            className="mobile-only"
            onClick={handleNavOpen}
          >
              <MenuIcon />
          </IconButton>

          <Menu
            anchorEl={navAnchor}
            open={Boolean(navAnchor)}
            onClose={handleNavClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          >
            {navigationItems.map((item) => {
              const Icon = iconMap[item.icon] || Dashboard;
              return (
                <MenuItem
                  key={item.id}
                  onClick={() => { navigate(item.path); handleNavClose(); }}
                >
                  <Icon sx={{ mr: 1 }} />
                  {item.label}
                </MenuItem>
              );
            })}
          </Menu>
          <Box component="img" src="/rag.png" alt="RAG" sx={{ height: 36, width: 36 }} className="desktop-only"/>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }} className="desktop-only">
                  Easy Rag
              </Typography>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: 'calc(100vw - 400px)',
              px: 3,
              py: 1,
              whiteSpace: 'nowrap',
              overflow: 'visible',
            }}
          >
            <Box 
              sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: 'success.main', 
                mr: 1.5,
                flexShrink: 0 
              }} 
            />

            <Typography 
              variant="subtitle1"
              component="span" 
              sx={{ 
                color:  'text.secondary', 
                fontWeight: 600, 
                mr: 1.5,
                flexShrink: 0
              }}
            >
              Topic:
            </Typography>
            <Typography 
              variant="h6"
              component="span" 
              sx={{ 
                color: theme == 'dark' ? 'text.primary' : '#ffffff',
                fontWeight: 700,
                textTransform: 'capitalize',
                overflow: 'visible',
                whiteSpace: 'nowrap',
              }}
            >
              {currrentTopic}
            </Typography>
          </Box>
          <Box>
            <IconButton color="inherit" onClick={onOpenSettings} aria-label="settings">
              <SettingsIcon />
            </IconButton>
          </Box>
      </Toolbar>
    </AppBar>
  )
}