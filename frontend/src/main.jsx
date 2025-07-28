import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// 创建一个暗色主题
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1a3a1a',
      paper: '#2a4a2a',
    },
    primary: {
      main: '#ffab40', // 琥珀色
    },
    secondary: {
      main: '#e0e0e0', // 灰色
    },
  },
});


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)