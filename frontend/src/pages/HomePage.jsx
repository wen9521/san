import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import StyleIcon from '@mui/icons-material/Style';
import '../styles/App.css';

const HomePage = () => {
  return (
    // 使用 Box 作为最外层容器，并设置 flex 布局使其内容垂直和水平居中
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2, // 添加一些内边距
      }}
    >
      <Box className="home-menu glass-effect">
        <StyleIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          扑克游戏中心
        </Typography>
        <Typography variant="body1" color="secondary" sx={{ mb: 4 }}>
          请选择您想玩的游戏
        </Typography>

        <Link to="/thirteen" style={{ textDecoration: 'none', width: '100%' }}>
          <Button variant="contained" color="primary" size="large" fullWidth>
            十三张
          </Button>
        </Link>

        <Link to="/eight" style={{ textDecoration: 'none', width: '100%', marginTop: '1rem' }}>
          <Button variant="outlined" color="secondary" size="large" fullWidth>
            八张（开发中）
          </Button>
        </Link>
      </Box>
    </Box>
  );
};

export default HomePage;