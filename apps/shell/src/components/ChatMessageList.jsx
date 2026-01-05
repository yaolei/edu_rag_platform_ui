// components/ChatMessageList.jsx
import React, {useState, useMemo} from 'react'
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

import PersonIcon from '@mui/icons-material/Person'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import {MarkdownRender} from './markdown'
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

  // 使用 useMemo 记忆化消息列表
  const memoizedMessages = useMemo(() => {
    return messages.map((msg, idx) => ({
      ...msg,
      id: msg.id || `${msg.type}-${msg.timestamp}-${idx}` // 为每个消息创建唯一ID
    }));
  }, [messages]);

  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        overflowY: 'auto', // 改为 auto 而不是 hidden
        overflowX: 'hidden',
        p: 2,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      '&::-webkit-scrollbar': { 
        width: '6px',
        height: '6px'
      },
      '&::-webkit-scrollbar-track': { 
        background: 'transparent',
        borderRadius: '3px'
      },
      '&::-webkit-scrollbar-thumb': {
        background: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
        borderRadius: '3px',
        '&:hover': {
          background: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
        }
      }
      }}
    >
      {memoizedMessages.map((msg, idx) => (
        <Box
          key={msg.id}
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
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.6, fontSize: '0.7rem' }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </Typography>

            {/* 图片（如果有） */}
            {msg.image && (
              <Box sx={{ position: 'relative' }}>
                {msg.image._storable?.data && msg.image._fromHistory ? (
                  <img
                    key={`image-history-${msg.image.id}`}
                    src={msg.image._storable.data}
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
                ) : (
                  // 新图片：使用Blob URL
                  <>
                    {imageErrors[idx] || !msg.image.src ? (
                      // 图片加载失败的回退
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
                        <BrokenImageIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                        <Typography variant="caption" sx={{ mt: 0.5 }}>
                          图片加载失败
                        </Typography>
                      </Box>
                    ) : (
                      // 正常显示Blob URL
                      <img
                        key={`image-new-${msg.image.id}`}
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
                    )}
                  </>
                )}
                
                {/* 图片信息 */}
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
                  <Typography variant="caption" color="textSecondary">
                    {msg.image.name}
                  </Typography>
                  {msg.image._fromHistory && (
                    <Typography variant="caption" color="textSecondary">
                      (历史图片)
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            {/* 文件（如果有） */}
            {msg.file && (
              <Paper sx={{ 
                p: 1, 
                bgcolor: msg.type === 'user' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', 
                borderRadius: 1, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                alignSelf: 'stretch',
                // 如果上面有图片，添加上边距
                mt: msg.image ? 0.5 : 0
              }}>
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

            {/* 消息内容（如果有） */}
            {msg.content && (
              <Paper
                sx={{
                  maxWidth: '100%',
                  p: 1.5,
                  bgcolor: msg.type === 'user' ? 'primary.main' : 'action.hover',
                  color: msg.type === 'user' ? 'primary.contrastText' : 'text.primary',
                  borderRadius: 2,
                  wordBreak: 'break-word',
                  mt: (msg.image || msg.file) ? 0.5 : 0
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