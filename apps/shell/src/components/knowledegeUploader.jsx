import React, {useState} from 'react'
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import PersonIcon from '@mui/icons-material/Person';
import CodeIcon from '@mui/icons-material/Code';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';

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
    isUploadingButtonEnabled,
    documentType,
    onDocumentTypeChange
}) => {
    const theme = localStorage.getItem('themeMode') || 'dark';

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [tempFileName, setTempFileName] = useState(customFileName);
    
    const handleDocumentTypeChange = (event) => {
        onDocumentTypeChange(event.target.value);
    };
    
    const handleOpenEditDialog = () => {
        setTempFileName(customFileName);
        setEditDialogOpen(true);
    };
    
    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
    };
    
    const handleSaveFileName = () => {
        onCustomFileNameChange({ target: { value: tempFileName } });
        setEditDialogOpen(false);
    };

    // 根据主题设置颜色
    const isDarkMode = theme === 'dark';
    const paperBg = isDarkMode ? '#2d3748' : '#ffffff';
    const previewBg = isDarkMode ? '#1a202c' : '#f7fafc';
    const previewBorder = isDarkMode ? '#4a5568' : '#e2e8f0';
    const textPrimary = isDarkMode ? '#e2e8f0' : '#2d3748';
    const textSecondary = isDarkMode ? '#a0aec0' : '#718096';
    const cardBg = isDarkMode ? '#2d3748' : '#ffffff';
    const cardBorder = isDarkMode ? '#4a5568' : '#edf2f7';
    const buttonBg = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.04)';
    const buttonHoverBg = isDarkMode ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.08)';

   return (
    <Paper 
        elevation={3} 
        sx={{ 
            p: 3, 
            mb: 4,
            backgroundColor: paperBg,
            color: textPrimary
        }}
    >
        {/* 文件名编辑对话框 */}
        <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
            <DialogTitle>Edit File Name</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="File Name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={tempFileName}
                    onChange={(e) => setTempFileName(e.target.value)}
                    helperText="Enter a custom name for your file"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseEditDialog}>Cancel</Button>
                <Button onClick={handleSaveFileName} variant="contained">
                    Update
                </Button>
            </DialogActions>
        </Dialog>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-col-mobile">
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        name='file'
                        className='hidden'
                        onChange={onFileChange}
                        accept=".pdf,.doc,.docx,.txt,.md, .csv, .json, .xlsx, .pptx, .html, .htm, .xml"
                        id='knowledge-file-input'
                    />
                    <div className='flex items-center gap-4 w-full md:w-auto justify-between'>
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
                                    color: isDarkMode ? '#fff' : '#000',
                                    backgroundColor: buttonBg,    
                                    backdropFilter: 'blur(4px)',                     
                                    border: '1px solid rgba(255, 255, 255, 0.25)',
                                    '&:hover': {
                                    backgroundColor: buttonHoverBg,
                                    },
                                }}
                                startIcon={<AttachFileIcon />}
                            >
                                Select File
                            </Button>
                        </label>
                        <div>
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
                                     color: isDarkMode ? '#fff' : '#000',                                  
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',    
                                    backdropFilter: 'blur(4px)',                     
                                    border: '1px solid rgba(255, 255, 255, 0.25)',
                                    '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                    },
                                }}
                                className="h-12 upload-btn self-center md:self-auto bg-green-600 hover:bg-green-700"
                                startIcon={<CloudUploadIcon />}
                            >
                                {isUploading ? 'Uploading...' : 'Upload file'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
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
            <Box 
                className="mt-4 p-4 rounded-lg border"
                sx={{
                    backgroundColor: previewBg,
                    borderColor: previewBorder,
                    color: textPrimary
                }}
            >
                {/* 标题栏 - 包含删除按钮 */}
                <Box className="flex items-center justify-between mb-3">
                    <Typography variant="subtitle2" className="font-semibold">
                        Upload Preview
                    </Typography>
                    <Box className="flex items-center space-x-1">
                        <Tooltip title="Remove file">
                            <IconButton 
                                size="small" 
                                onClick={clearSelectedFile}
                                sx={{ 
                                    backgroundColor: buttonBg,
                                    '&:hover': {
                                        backgroundColor: buttonHoverBg,
                                    }
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
                
                <Divider sx={{ borderColor: previewBorder, mb: 3 }} />
                
                <Box className="space-y-3">
                    {/* 文件信息区域 */}
                    <Box 
                        className="flex items-start space-x-3 p-2 rounded border"
                        sx={{
                            backgroundColor: cardBg,
                            borderColor: cardBorder,
                            cursor: 'pointer',
                            '&:hover': {
                                borderColor: isDarkMode ? '#718096' : '#cbd5e0',
                                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                            }
                        }}
                        onClick={handleOpenEditDialog}
                    >
                        <DescriptionIcon 
                            sx={{ 
                                color: '#4299e1', 
                                mt: 0.5 
                            }} 
                            fontSize="small" 
                        />
                        <Box className="flex-1">
                            <Box className="flex items-center justify-between">
                                <Typography 
                                    variant="body2" 
                                    className="font-medium"
                                    sx={{ color: textPrimary }}
                                >
                                    {customFileName}.{selectedFile.name.split('.').pop()}
                                </Typography>
                                <Box className="flex items-center space-x-1">
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            color: textSecondary,
                                            mr: 1
                                        }}
                                    >
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </Typography>
                                    <EditIcon 
                                        sx={{ 
                                            fontSize: 16, 
                                            color: textSecondary,
                                            opacity: 0.7 
                                        }} 
                                    />
                                </Box>
                            </Box>
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: textSecondary,
                                    fontStyle: 'italic'
                                }}
                            >
                                Click to edit file name
                            </Typography>
                        </Box>
                    </Box>
                    
                    {/* 知识类型选择 */}
                    <Box 
                        className="p-2 rounded border"
                        sx={{
                            backgroundColor: cardBg,
                            borderColor: cardBorder
                        }}
                    >
                        <Typography 
                            variant="caption" 
                            className="block font-medium mb-2"
                            sx={{ color: textPrimary }}
                        >
                            Knowledge Type
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={documentType}
                                onChange={handleDocumentTypeChange}
                                displayEmpty
                                sx={{
                                    '& .MuiSelect-select': {
                                        py: 1.5,
                                        fontSize: '0.875rem',
                                        color: textPrimary,
                                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f7fafc'
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: cardBorder
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: isDarkMode ? '#718096' : '#cbd5e0'
                                    }
                                }}
                            >
                                <MenuItem value="document">
                                    <Box className="flex items-center space-x-2">
                                        <ArticleIcon fontSize="small" sx={{ color: textSecondary }} />
                                        <span style={{ color: textPrimary }}>Document</span>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="resume">
                                    <Box className="flex items-center space-x-2">
                                        <PersonIcon fontSize="small" sx={{ color: textSecondary }} />
                                        <span style={{ color: textPrimary }}>Resume</span>
                                    </Box>
                                </MenuItem>
                                <MenuItem value="code">
                                    <Box className="flex items-center space-x-2">
                                        <CodeIcon fontSize="small" sx={{ color: textSecondary }} />
                                        <span style={{ color: textPrimary }}>Code</span>
                                    </Box>
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <Typography 
                            variant="caption" 
                            className="mt-2 block"
                            sx={{ color: isDarkMode ? '#a0aec0' : '#718096' }}
                        >
                            Select the type to optimize processing
                        </Typography>
                    </Box>
                </Box>
            </Box>
        )}
    </Paper>
   )
}

export default KnowledgeUploader