import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ThirteenGamePage from './pages/ThirteenGamePage';
import { Box, Typography } from '@mui/material';

// 这是一个临时的八张游戏占位组件
const EightGamePlaceholder = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Typography variant="h4" color="white">
      八张游戏正在快马加鞭开发中...
    </Typography>
  </Box>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/thirteen" element={<ThirteenGamePage />} />
      <Route path="/eight" element={<EightGamePlaceholder />} />
    </Routes>
  );
}

export default App;