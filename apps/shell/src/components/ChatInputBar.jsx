import React,{ useRef } from 'react'
import { Box, TextField, IconButton, CircularProgress } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DeleteIcon from '@mui/icons-material/Delete'

export function ChatInputBar({
  input,
  onInputChange,
  onKeyDown,
  onSend,
  onFileUpload,
  onImageUpload,
  loading,
  uploadedFile,
  uploadedImages,
  onClearHistory,
  showClearButton

}) {
  const inputRef = useRef(null);
  const handleClick = () => inputRef.current?.click();

    const handleChange = (e) => {

     const files = Array.from(e.target.files || [])
     if (files.length === 0) return
  
     const hasImage = files.some(f => f.type.startsWith('image/'))
     if (hasImage) {
       onImageUpload({ target: { files: e.target.files } })
     } else {
       onFileUpload({ target: { files: e.target.files } })
     }
     e.target.value = ''
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
      <TextField
        fullWidth
        multiline
        maxRows={4}
        minRows={3}
        placeholder="Ask your question here... (Press Enter to send, Shift+Enter for new line)"
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={loading}
        variant="outlined"
        size="small"
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pb: 0.5 }}>

        {showClearButton && (
            <IconButton
              onClick={onClearHistory}
              disabled={loading}
              size="small"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
        )}

        <IconButton
          onClick={handleClick}
          disabled={loading}
          size="small"
          title="Upload file"
          color={uploadedFile ? 'success' : 'default'}
        >
          <AttachFileIcon />
        </IconButton>

        <IconButton
          onClick={onSend}
          disabled={(!input.trim() && !uploadedFile && uploadedImages.length === 0) || loading}
          color="primary"
          size="small"
          title="Send question (Enter)"
          sx={{
            transition: 'transform 200ms',
            '&:hover:not(:disabled)': { transform: 'scale(1.1)' },
            '&:active:not(:disabled)': { transform: 'scale(0.95)' }
          }}
        >
          {loading ? <CircularProgress size={20} /> : <SendIcon />}
        </IconButton>
      </Box>
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={handleChange}
        accept="*/*"
        multiple
      />
    </Box>
  )
}