import React from 'react'
import { Box, Paper, Typography, Avatar, CircularProgress } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import {MarkdownRender} from '@workspace/shared-components'

export function ChatMessageList({ messages, loading, responsesEndRef }) {
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
                  <MarkdownRender content={msg.content} />
              ) : (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </Typography>
              )}
              </Paper>
            )}

            {msg.image && (
              <Box
                component="img"
                src={msg.image.src}
                alt={msg.image.name}
                sx={{ maxWidth: 200, maxHeight: 200, borderRadius: 2, objectFit: 'cover' }}
              />
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