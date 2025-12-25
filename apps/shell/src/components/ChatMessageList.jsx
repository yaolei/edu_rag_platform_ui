import React, {useState} from 'react'
import { Box, Paper, Typography, Avatar, CircularProgress, IconButton} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import {MarkdownRender} from '@workspace/shared-components'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import BrokenImageIcon from '@mui/icons-material/BrokenImage'
import { useTheme } from '../context/ThemeContext' 


export function ChatMessageList({ messages, loading, responsesEndRef }) {
  const [imageErrors, setImageErrors] = useState({})
  const themeContext = useTheme() 
  const isDarkMode = themeContext.currentMode === 'dark'

  const handleImageError = (messageIndex) => {
    setImageErrors(prev => ({ ...prev, [messageIndex]: true }))
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        overflow: 'hidden',
        p: 2,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        '&:hover': {
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '3px'
          }
        }
      }}
    >
      {messages.map((msg, idx) => (
        <Box
          key={idx}
          sx={{
            display: 'flex',
            gap: 1.5,
            justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
            animation: 'fadeIn 0.3s ease-in',
            alignItems: 'flex-end'
          }}
        >
          {msg.type === 'ai' && (
            <Avatar src="/robot1.avif" alt="AI Robot" sx={{ width: 36, height: 36, flexShrink: 0 }} />
          )}

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '60%',
              gap: 0.5
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.7rem' }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </Typography>

            {msg.content && (
              <Paper
                sx={{
                  maxWidth: '100%',
                  p: 1.5,
                  bgcolor: msg.type === 'user' ? 'primary.main' : 'action.hover',
                  color: msg.type === 'user' ? 'primary.contrastText' : 'text.primary',
                  borderRadius: 2,
                  wordBreak: 'break-word'
                }}
              >
              {msg.type === 'ai' ? (
                  <MarkdownRender content={msg.content} isDarkMode={isDarkMode}/>
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
              )}
              </Paper>
            )}

            {/* Image Display with Error Handling */}
            {msg.image && (
              <Box sx={{ mt: 1, mb: 1, position: 'relative' }}>
                {imageErrors[idx] || !msg.image.src ? (
                  // Fallback when image fails to load or has no src
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      border: '1px dashed',
                      borderColor: 'grey.400',
                      borderRadius: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'grey.600',
                      bgcolor: 'grey.100',
                    }}
                  >
                    <Box sx={{ 
                        display: 'flex-c', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 0.5 
                      }}>
                    <BrokenImageIcon sx={{ 
                      fontSize: 48, 
                      color: 'grey.400',
                      position: 'relative',
                      top: '2px'
                    }} />
                    </Box>
                  </Box>
                ) : (
                  // Display image if it loads successfully
                  <>
                    <img
                      src={msg.image.src}
                      alt={msg.image.name || 'Uploaded image'}
                      onError={() => handleImageError(idx)}
                      style={{
                        maxWidth: '100%',
                        maxHeight: 300,
                        objectFit: 'contain',
                        borderRadius: 4,
                        border: '1px solid #e0e0e0',
                      }}
                    />
                    {/* Image actions */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                      <Typography variant="caption" color="textSecondary">
                        {msg.image.name}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            )}

            {msg.file && (
              <Paper sx={{ p: 1, bgcolor: msg.type === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachFileIcon sx={{ fontSize: 18 }} />
                <Box>
                  <Typography variant="caption" sx={{ display: 'block', fontWeight: 500 }}>
                    {msg.file.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {formatFileSize(msg.file.size)}
                  </Typography>
                </Box>
              </Paper>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <Typography variant="caption" color="textSecondary">
                {new Date(msg.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Typography>
              
              {msg.type === 'ai' && msg.content && (
                  <IconButton size="small" onClick={() => handleCopy(msg.content)}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
              )}
            </Box>

          </Box>

          {msg.type === 'user' && (
            <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, flexShrink: 0 }}>
              <PersonIcon />
            </Avatar>
          )}
        </Box>
      ))}

      {loading && (
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
          <Avatar src="/robot1.avif" alt="AI Robot" sx={{ width: 36, height: 36 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="caption">Robot is thinking...</Typography>
          </Box>
        </Box>
      )}

      <div ref={responsesEndRef} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Paper>
  )
}