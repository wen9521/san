import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { GameProvider } from './context/GameContext'; // 引入 GameProvider

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
      <BrowserRouter>
        <GameProvider> {/* 在这里包裹 */}
          <App />
        </GameProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);