import React, { useCallback, useState, useEffect } from 'react'
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';


import CloseIcon from '@mui/icons-material/Close'
import AttachFileIcon from '@mui/icons-material/AttachFile'

export function UploadPreview({ uploadedImages = [], uploadedFile, onRemoveImage, onRemoveFile }) {
  const [previewUrls, setPreviewUrls] = useState({})
  
  const formatFileSize = useCallback((bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }, [])

  // 为图片创建预览 URL
  useEffect(() => {
    const newUrls = {}
    
    uploadedImages.forEach((img) => {
      if (img.file && img.id && !previewUrls[img.id]) {
        newUrls[img.id] = URL.createObjectURL(img.file)
      }
    })
    
    if (Object.keys(newUrls).length > 0) {
      setPreviewUrls(prev => ({ ...prev, ...newUrls }))
    }
    
    // 清理函数
    return () => {
      Object.values(newUrls).forEach(url => {
        if (url && typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [uploadedImages])

  const handleRemoveImage = useCallback((idx) => {
    const imageToRemove = uploadedImages[idx]
    if (imageToRemove && imageToRemove.id && previewUrls[imageToRemove.id]) {
      URL.revokeObjectURL(previewUrls[imageToRemove.id])
      setPreviewUrls(prev => {
        const newUrls = { ...prev }
        delete newUrls[imageToRemove.id]
        return newUrls
      })
    }
    onRemoveImage(idx)
  }, [uploadedImages, previewUrls, onRemoveImage])

  const handleRemoveFile = useCallback(() => {
    onRemoveFile()
  }, [onRemoveFile])

  // 将条件返回移到所有 Hook 调用之后
  if (uploadedImages.length === 0 && !uploadedFile) return null

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {uploadedImages.map((img, idx) => (
        <Box key={img.id || idx} sx={{ position: 'relative', width: 80, height: 80 }}>
          {previewUrls[img.id] && (
            <>
              <Box
                component="img"
                src={previewUrls[img.id]}
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
                onClick={() => handleRemoveImage(idx)}
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
            </>
          )}
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
          <IconButton onClick={handleRemoveFile} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}