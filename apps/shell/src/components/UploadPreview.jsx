import React from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AttachFileIcon from '@mui/icons-material/AttachFile'

export function UploadPreview({ uploadedImage, uploadedFile, onRemoveImage, onRemoveFile }) {
  if (!uploadedImage && !uploadedFile) return null

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      {uploadedImage && (
        <Box sx={{ position: 'relative', width: 80, height: 80 }}>
          <Box
            component="img"
            src={uploadedImage.src}
            alt="preview"
            sx={{ width: '100%', height: '100%', borderRadius: 1, objectFit: 'cover', border: '1px solid', borderColor: 'divider' }}
          />
          <IconButton
            onClick={onRemoveImage}
            size="small"
            sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white', '&:hover': { bgcolor: 'error.dark' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      {uploadedFile && (
        <Box sx={{ p: 1, bgcolor: 'action.hover', borderRadius: 1, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1, flex: 1, position: 'relative' }}>
          <AttachFileIcon />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {uploadedFile.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {formatFileSize(uploadedFile.size)}
            </Typography>
          </Box>
          <IconButton onClick={onRemoveFile} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}