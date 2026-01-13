import React, { useState, useEffect} from 'react'
import {useNavigate, useLocation} from 'react-router'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DeleteIcon from '@mui/icons-material/Delete'
// import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import SettingsIcon from '@mui/icons-material/Settings'
import MenuIcon from '@mui/icons-material/Menu'
import {navigationItems} from '../config/navigation'
import * as MuiIcons from '@mui/icons-material';
import {useDispatch, useSelector} from 'react-redux'
import { hasHistroy } from '../utils/stateSlice/chatHistorySlice';
export function TopBar({ onOpenSettings }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const hasHistory = useSelector(state => state.chatHistory.hasHistroy)
  const currrentTopic = useSelector(state => state.chatTopics.chatTopiceValue)
  const [anchorEl, setAnchorEl] = useState(null)
  const [navAnchor, setNavAnchor] = useState(null);
  const theme = localStorage.getItem('themeMode') || 'dark';

  useEffect(() => {
    const checkStorage = () => {
      try {
        const saved = sessionStorage.getItem('chat_history_default');
        if (saved) {
          const parsed = JSON.parse(saved);
          const hasUser = parsed.some(msg => msg.type === 'user');
        }
      } catch (e) {
        console.error('检查sessionStorage失败:', e);
      }
    };
    
    checkStorage();
  }, [hasHistory]);

  const isRobotPage = location.pathname === '/robot';
  const showClearButton = isRobotPage && hasHistory;
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => {  
      localStorage.removeItem('token');
      navigate('/login')
}

    const handleNavOpen  = (e) => setNavAnchor(e.currentTarget);
    const handleNavClose = () => setNavAnchor(null);

    const handleClearClick = () => {
    if (window.confirm('Do you want to clear the history list ?')) {
      dispatch(hasHistroy(false));
    }
  };

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
                  Easy RAG
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
            {showClearButton && (
              <IconButton 
                color="inherit" 
                onClick={handleClearClick}
                aria-label="clear chat history"
                sx={{ mr: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            )}
            <IconButton color="inherit" onClick={onOpenSettings} aria-label="settings">
              <SettingsIcon />
            </IconButton>

            {/* <IconButton color="inherit" onClick={handleMenuOpen} aria-label="account">
              <AccountCircleIcon sx={{ fontSize: 32 }} />
            </IconButton> */}

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={()=>{}}>Profile</MenuItem>
              {showClearButton && (
                <MenuItem 
                  onClick={handleClearClick}
                  className="desktop-only"
                >
                  <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
                  Clear Chat History
                </MenuItem>
              )}
              <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
            </Menu>
          </Box>
      </Toolbar>
    </AppBar>
  )
}