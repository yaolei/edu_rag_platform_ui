import React, { useRef, useCallback, memo, useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import SendIcon from '@mui/icons-material/Send'
import AttachFileIcon from '@mui/icons-material/AttachFile'

export const ChatInputBar = memo(function ChatInputBar({
  onSend,
  onFileUpload,
  onImageUpload,
  loading,
  uploadedFile,
  uploadedImages,
}) {

 const [input, setInput] = useState('')
  const fileInputRef = useRef(null)
  
  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleChange = useCallback((e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
  
    const hasImage = files.some(f => f.type.startsWith('image/'))
    if (hasImage) {
      onImageUpload({ target: { files: e.target.files } })
    } else {
      onFileUpload({ target: { files: e.target.files } })
    }
    e.target.value = ''
  }, [onFileUpload, onImageUpload]);

  const handleSend = useCallback(() => {
    const currentInput = input.trim()
    const canSend = currentInput || uploadedFile || uploadedImages.length > 0
    if (!canSend || loading) return

    onSend(currentInput)
    setInput('')
  }, [input, onSend, uploadedFile, uploadedImages.length, loading]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend, loading])

  const handleTextFieldChange = useCallback((e) => {
    setInput(e.target.value)
  }, [])

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
      <TextField
        fullWidth
        className="mobile-only-input"
        multiline
        maxRows={4}
        minRows={3}
        placeholder="Ask your question here... (Press Enter to send, Shift+Enter for new line)"
        value={input}
        onChange={handleTextFieldChange}
        onKeyDown={handleKeyDown}
        disabled={loading}
        variant="outlined"
        size="small"
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pb: 0.5 }}>
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
          onClick={handleSend}
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
        ref={fileInputRef}
        type="file"
        hidden
        onChange={handleChange}
        accept="*/*"
        multiple
      />
    </Box>
  )
});