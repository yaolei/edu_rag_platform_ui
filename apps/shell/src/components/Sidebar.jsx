import React from 'react'
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';


import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import * as MuiIcons from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router'
import { navigationItems } from '../config/navigation'

const drawerWidth = 240
const collapsedWidth = 72

export function Sidebar({className, collapsed, onToggleCollapse }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className='desktop-only'>
    <Drawer
      variant="permanent"
       classes={{ paper: className }} 
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? collapsedWidth : drawerWidth,
          boxSizing: 'border-box',
          position: 'fixed',
          top: 64,
          left: 0,
          height: 'calc(100vh - 64px)',
          transition: 'width 300ms cubic-bezier(0.4,0,0.2,1), background-color 200ms',
          overflowX: 'hidden'
        }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'opacity 300ms' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            px: 2,
            height: 70,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6" sx={{ display: collapsed ? 'none' : 'block', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Menu
          </Typography>
          <IconButton
            onClick={onToggleCollapse}
            size="small"
            sx={{
              transition: 'transform 240ms',
              transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)'
            }}
            aria-label="toggle sidebar"
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Box>

        <Divider />

        <List sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
          {navigationItems.map((item) => {
            const IconComponent = MuiIcons[item.icon] || MuiIcons.Dashboard
            const active = location.pathname === item.path
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={collapsed ? item.label : ''} placement="right">
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={active}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      px: collapsed ? 1 : 2,
                      borderRadius: 1,
                      '&.Mui-selected': { bgcolor: 'action.selected' },
                      transition: 'transform 200ms cubic-bezier(0.4,0,0.2,1), background-color 200ms',
                      // 防止文字换行并显示省略号，解决“上下显示”问题
                      overflow: 'hidden'
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: active ? 'primary.main' : 'inherit', transition: 'transform 200ms' }}>
                      <IconComponent />
                    </ListItemIcon>

                    {!collapsed && (
                      <ListItemText
                        primary={item.label}
                        sx={{
                          '& .MuiTypography-root': { fontWeight: active ? 600 : 500 },
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            )
          })}
        </List>
      </Box>

      {/* 局部样式：点击反馈（按下时） */}
      <style>{`
        .MuiListItemButton-root:active {
          transform: translateY(1px);
        }
        .MuiListItemButton-root:hover {
          transform: translateX(4px);
        }
        .@media (max-width: 600px) {
          .desktop-only { display: none !important; }
          .mobile-only  { display: block !important; }
        }
        @media (min-width: 601px) {
        .desktop-only { display: block !important; }
        .mobile-only  { display: none !important; }
        }
      `}</style>
    </Drawer>
    </div>
  )
}