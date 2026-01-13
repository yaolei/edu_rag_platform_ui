import React from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import CodeIcon from '@mui/icons-material/Code';
import ImageIcon from '@mui/icons-material/Image';
import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useTheme } from '../context/ThemeContext'
import {useSelector, useDispatch } from 'react-redux'
import { setChatTopicValue } from '../utils/stateSlice/chatTopicSlice';

export function SettingsDrawer({ open, onClose }) {
  const { themeMode, setThemeMode } = useTheme()
  const isDarkMode = themeMode === 'dark';
  const textPrimary = isDarkMode ? '#e2e8f0' : '#2d3748';
  const textSecondary = isDarkMode ? '#a0aec0' : '#718096';
  const cardBorder = isDarkMode ? '#4a5568' : '#edf2f7';

  const hasChatTopic = useSelector(state => state.chatTopics.chatTopiceValue)
  const dispatch = useDispatch()
  const handleDocumentTypeChange = (event) => {
    dispatch(setChatTopicValue(event.target.value))
  };

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
          marginTop: '55px',
          overflow: 'hidden',
          transition: 'width 300ms cubic-bezier(0.4,0,0.2,1)'
        },
        className: 'bg-white dark:bg-gray-800'
      }}
    >

      <Box sx={{ p: 2, overflowY: 'auto' }}>
        <Typography sx={{ mb: 2, fontWeight: 500 }}>Themes</Typography>

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

        <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary', fontSize: 16,
          fontWeight: 500 }}>
            The theme will take effect immediately after being changed
        </Typography>
      </Box>
     <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
      </Box>
        <Box sx={{ p: 2, pt: 0, overflowY: 'auto' }}>
          <Typography sx={{pb:2}}>Chat Topic</Typography>
            <Box>
                <FormControl fullWidth size="small">
                    <Select
                        value={hasChatTopic}
                        onChange={handleDocumentTypeChange}
                        displayEmpty
                        sx={{
                            '& .MuiSelect-select': {
                                py: 1.5,
                                fontSize: '0.875rem',
                                color: textPrimary,
                                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f7fafc'
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: cardBorder
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: isDarkMode ? '#718096' : '#cbd5e0'
                            }
                        }}
                    >
                      <MenuItem value="chat">
                            <Box className="flex items-center space-x-2">
                                <ChatBubbleOutlineIcon fontSize="small" sx={{ color: textSecondary }} />
                                <span style={{ color: textPrimary }}>Chat</span>
                            </Box>
                        </MenuItem>
                        <MenuItem value="document">
                            <Box className="flex items-center space-x-2">
                                <ArticleIcon fontSize="small" sx={{ color: textSecondary }} />
                                <span style={{ color: textPrimary }}>Document</span>
                            </Box>
                        </MenuItem>
                        <MenuItem value="resume">
                            <Box className="flex items-center space-x-2">
                                <PersonIcon fontSize="small" sx={{ color: textSecondary }} />
                                <span style={{ color: textPrimary }}>Resume</span>
                            </Box>
                        </MenuItem>
                        <MenuItem value="code">
                            <Box className="flex items-center space-x-2">
                                <CodeIcon fontSize="small" sx={{ color: textSecondary }} />
                                <span style={{ color: textPrimary }}>Code</span>
                            </Box>
                        </MenuItem>
                        <MenuItem value="image">
                            <Box className="flex items-center space-x-2">
                                <ImageIcon fontSize="small" sx={{ color: textSecondary }} />
                                <span style={{ color: textPrimary }}>Image Description</span>
                            </Box>
                        </MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'text.secondary', fontSize: 16,
        fontWeight: 500 }}>
                When you choose a chat topic from the system, all the knowledge base resources will change accordingly, making your conversations more accurate.
            </Typography>
        </Box>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">More settings will be added gradually.</Typography>
      </Box>

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