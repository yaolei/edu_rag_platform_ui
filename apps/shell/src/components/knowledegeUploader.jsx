import React from 'react'
import { Button, Paper, LinearProgress, Box, Typography, IconButton, TextField} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'


const KnowledgeUploader = ({ 
    fileInputRef,
    selectedFile,
    onFileChange,
    clearSelectedFile,
    customFileName,
    onCustomFileNameChange,
    submitFiles,
    isUploading,
    uploadProgress,
    isUploadingButtonEnabled
}) => {
   return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-col-mobile">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        name='file'
                        className='hidden'
                        onChange={onFileChange}
                        id='knowledge-file-input'
                    />
                    <label htmlFor="knowledge-file-input">
                        <Button 
                            variant="contained" 
                            component="span" 
                            className="bg-blue-600 hover:bg-blue-700 upload-btn"
                            sx={{
                                mt: 3,
                                borderRadius: '20px',
                                fontWeight: 600,
                                textTransform: 'none',
                                color: '#fff',                                   
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',    
                                backdropFilter: 'blur(4px)',                     
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                },
                            }}
                            startIcon={<CloudUploadIcon />}
                        >
                            Select File
                        </Button>
                    </label>
                    </div>

                    {selectedFile && (
                        <div className="mt-2">
                            <div className="flex items-center mb-2">
                                <Typography variant="body2" className="mr-2">
                                    Selected File: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                </Typography>
                                <IconButton size="small" onClick={clearSelectedFile}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </div>
                            <TextField
                                label="Custom File Name"
                                variant="outlined"
                                size="small"
                                value={customFileName}
                                onChange={onCustomFileNameChange}
                                className="mb-2"
                                placeholder="Enter custom name for the knowledge file"
                                fullWidth
                                margin="normal"
                            />
                        </div>
                    )}
                </div>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={submitFiles}
                    disabled={!isUploadingButtonEnabled()}
                    sx={{
                        mt: 3,
                        borderRadius: '20px',
                        fontWeight: 600,
                        textTransform: 'none',
                        color: '#fff',                                   
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',    
                        backdropFilter: 'blur(4px)',                     
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        },
                    }}
                    className="h-12 upload-btn self-center md:self-auto bg-green-600 hover:bg-green-700"
                >
                    {isUploading ? 'Uploading...' : 'Upload file'}
                </Button>
        </div>
        
        {isUploading && (
            <Box className="mt-4">
                <Box display="flex" alignItems="center" >
                    <Box width="100%" mr={1}>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                    </Box>
                    <Box minWidth={35}>       
                        <Typography variant="body2" color="textSecondary">
                            File:{customFileName}.{selectedFile.name.split('.').pop()}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        )}

        {selectedFile && (
            <Box className="mt-4 p-3 rounded">
                <Typography variant="body2" className="font-medium mb-1">
                    Ready to upload:
                </Typography>
                <Typography variant="body2" className="text-blue-700">
                    File:{customFileName}.{selectedFile.name.split('.').pop()} ( {(selectedFile.size / 1024).toFixed(2)} KB )
                </Typography>
            </Box>
        )}
    </Paper>
   )
}

export default KnowledgeUploader