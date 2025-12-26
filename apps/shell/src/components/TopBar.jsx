import React, { useState } from 'react'
import {useNavigate} from 'react-router'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';


import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import {navigationItems} from '../config/navigation'
import * as MuiIcons from '@mui/icons-material';
export function TopBar({ onOpenSettings }) {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState(null)
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => {  
    localStorage.removeItem('token');
    navigate('/login')
  }

  //for moblie saide
 const [navAnchor, setNavAnchor] = useState(null);
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
              const Icon = MuiIcons[item.icon] || MuiIcons.Dashboard;
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
            RAG Platform
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
            <MenuItem onClick={()=>{}}>Profile</MenuItem>
            <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}