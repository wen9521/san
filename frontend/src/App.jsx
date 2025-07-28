import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ThirteenGamePage from './pages/ThirteenGamePage';
import ComparisonPage from './pages/ComparisonPage'; // 引入新页面
import { Box, Typography } from '@mui/material';

const EightGamePlaceholder = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Typography variant="h4" color="white">八张游戏正在快马加鞭开发中...</Typography>
  </Box>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/thirteen" element={<ThirteenGamePage />} />
      <Route path="/comparison" element={<ComparisonPage />} /> {/* 新增路由 */}
      <Route path="/eight" element={<EightGamePlaceholder />} />
    </Routes>
  );
}

export default App;