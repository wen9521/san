import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: 'transparent', // 让我们的body背景透出来
      paper: '#2a4a2a',
    },
    primary: {
      main: '#ffab40', 
    },
    secondary: {
      main: '#e0e0e0',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)