import React, { useCallback, useMemo } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AttachFileIcon from '@mui/icons-material/AttachFile'

export function UploadPreview({ uploadedImages = [], uploadedFile, onRemoveImage, onRemoveFile }) {
  if (uploadedImages.length === 0 && !uploadedFile) return null

  const formatFileSize = useCallback((bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }, [])

  const handleRemoveImage = useCallback((idx) => {
    onRemoveImage(idx);
  }, [onRemoveImage]);

  const handleRemoveFile = useCallback(() => {
    onRemoveFile();
  }, [onRemoveFile]);

  // 使用 useMemo 缓存图片预览 URL
  const imagePreviews = useMemo(() => {
    return uploadedImages.map((img, idx) => {
      // 如果已经有 previewUrl，直接使用
      if (img.previewUrl) {
        return {
          ...img,
          previewUrl: img.previewUrl,
          id: img.id || `preview-${idx}-${Date.now()}`
        };
      }
      
      // 如果没有 previewUrl 但是有 file 对象，创建预览 URL
      if (img.file) {
        return {
          ...img,
          previewUrl: URL.createObjectURL(img.file),
          id: img.id || `preview-${idx}-${Date.now()}`
        };
      }
      
      // 如果是原始文件对象
      return {
        ...img,
        previewUrl: URL.createObjectURL(img),
        id: img.id || `preview-${idx}-${Date.now()}`
      };
    });
  }, [uploadedImages]);

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {imagePreviews.map((img, idx) => (
        <Box key={img.id} sx={{ position: 'relative', width: 80, height: 80 }}>
          <Box
            component="img"
            src={img.previewUrl}
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