import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: 'transparent', paper: '#2a4a2a' },
    primary: { main: '#ffab40' },
    secondary: { main: '#e0e0e0' },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
