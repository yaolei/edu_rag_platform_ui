import React, {useEffect} from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AttachFileIcon from '@mui/icons-material/AttachFile'

export function UploadPreview({ uploadedImages = [], uploadedFile, onRemoveImage, onRemoveFile }) {
  if (uploadedImages.length === 0 && !uploadedFile) return null

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }


  useEffect(() => {
    return () => {
      uploadedImages.forEach(f => {
        if (f instanceof File || f instanceof Blob) URL.revokeObjectURL(f)
      })
      if (uploadedFile instanceof File || uploadedFile instanceof Blob) {
        URL.revokeObjectURL(uploadedFile)
      }
    }
  }, [uploadedImages, uploadedFile])


  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {uploadedImages.map((img, idx) => (
        <Box key={idx} sx={{ position: 'relative', width: 80, height: 80 }}>
          <Box
            component="img"
            src={URL.createObjectURL(img)}
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: 1,
              objectFit: 'cover',
              border: '1px solid',
              borderColor: 'divider'
            }}
          />
          <IconButton
            onClick={() => onRemoveImage(idx)}
            size="small"
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': { bgcolor: 'error.dark' }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}

      {uploadedFile && (
        <Box
          sx={{
            p: 1,
            bgcolor: 'action.hover',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flex: 1,
            minWidth: 0,
            position: 'relative'
          }}
        >
          <AttachFileIcon />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{ display: 'block', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
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