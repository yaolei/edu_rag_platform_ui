import React from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

const ResponseNotice = ({ open, onClose, severity='success', message = 'success' }) => {
    return (
        <Snackbar open={open} 
            autoHideDuration={1000} 
            onClose={onClose} 
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert 
                onClose={onClose} 
                severity={severity} 
                vertical="filled"
                sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    )
}
export default ResponseNotice