import React from 'react'
import { Box, TextField, IconButton, CircularProgress } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import ImageIcon from '@mui/icons-material/Image'

export function ChatInputBar({
  input,
  onInputChange,
  onKeyDown,
  onSend,
  onFileUpload,
  onImageUpload,
  loading,
  uploadedFile,
  uploadedImage,
  fileInputRef,
  imageInputRef
}) {
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
        <IconButton
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          size="small"
          title="Upload file"
          color={uploadedFile ? 'success' : 'default'}
        >
          <AttachFileIcon />
        </IconButton>

        <IconButton
          onClick={() => imageInputRef.current?.click()}
          disabled={loading}
          size="small"
          title="Upload image"
          color={uploadedImage ? 'success' : 'default'}
        >
          <ImageIcon />
        </IconButton>

        <IconButton
          onClick={onSend}
          disabled={(!input.trim() && !uploadedFile && !uploadedImage) || loading}
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

      <input ref={fileInputRef} type="file" hidden onChange={onFileUpload} accept="*/*" />
      <input ref={imageInputRef} type="file" hidden onChange={onImageUpload} accept="image/*" />
    </Box>
  )
}