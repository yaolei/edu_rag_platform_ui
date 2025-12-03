import React from 'react'
import { Box, Typography, Container, Paper } from '@mui/material'

export function Settings() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="body1">
            Settings page content
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}