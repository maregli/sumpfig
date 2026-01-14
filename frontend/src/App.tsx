import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppLayout from 'components/AppLayout';
import { AuthProvider } from 'components/AuthProvider';
import { theme } from './theme';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <main>
          <AuthProvider>
            <AppLayout />
          </AuthProvider>
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
