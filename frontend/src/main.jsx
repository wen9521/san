import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
// 【核心修正】: 引入 HashRouter 而不是 BrowserRouter
import { HashRouter } from 'react-router-dom';
import { GameProvider } from './context/GameContext';

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
      {/* 【核心修正】: 在这里使用 HashRouter */}
      <HashRouter>
        <GameProvider>
          <App />
        </GameProvider>
      </HashRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
