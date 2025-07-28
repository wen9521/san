import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import StyleIcon from '@mui/icons-material/Style'; // 卡牌图标
import '../styles/App.css';

const HomePage = () => {
  return (
    <Container className="page-container">
      <Box className="home-menu glass-effect">
        <StyleIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          扑克游戏中心
        </Typography>
        <Typography variant="body1" color="secondary" sx={{ mb: 4 }}>
          请选择您想玩的游戏
        </Typography>

        <Link to="/thirteen" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary" size="large">
            十三张
          </Button>
        </Link>

        <Link to="/eight" style={{ textDecoration: 'none' }}>
          <Button variant="outlined" color="secondary" size="large">
            八张（开发中）
          </Button>
        </Link>
      </Box>
    </Container>
  );
};

export default HomePage;