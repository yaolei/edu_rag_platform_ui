import React from 'react';
import { useRoutes } from 'react-router';
import { BrowserRouter as Router } from 'react-router';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { createRoutes } from './config/routes';
import { getTheme } from './config/theme';

function AppContent() {
  const { currentMode } = useTheme();
  const element = useRoutes(createRoutes());

  return (
    <MuiThemeProvider theme={getTheme(currentMode)}>
      <CssBaseline />
      {element}
    </MuiThemeProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;