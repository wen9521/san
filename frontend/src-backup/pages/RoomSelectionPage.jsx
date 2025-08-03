import React from 'react';
import { Box, Typography, Button, Paper, Grid, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const RoomSelectionPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  const handlePlay = () => {
    navigate('/thirteen/play');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'radial-gradient(circle, #3a5a40 0%, #1e2d2b 100%)',
        p: 2,
        color: 'white',
      }}
    >
      {/* 顶部栏，包含返回按钮和标题 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={handleGoBack} sx={{ color: 'white', mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          选择房间
        </Typography>
      </Box>

      {/* 房间列表容器 */}
      <Grid container spacing={4} sx={{ flexGrow: 1 }}>
        {/* 普通场 */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#a5d6a7' }}>
            普通场
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1, 2, 5, 10, 20].map((score) => (
              <Button key={`normal-${score}`} onClick={handlePlay} variant="contained" sx={{ justifyContent: 'space-between', p: 2, background: 'rgba(255,255,255,0.1)' }}>
                <Typography>底分: {score}</Typography>
                <Typography>在线: {Math.floor(Math.random() * 200)}</Typography>
              </Button>
            ))}
          </Box>
        </Grid>

        {/* 翻倍场 */}
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#ef9a9a' }}>
            翻倍场
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
             {[1, 2, 5, 10, 20].map((score) => (
              <Button key={`double-${score}`} onClick={handlePlay} variant="contained" sx={{ justifyContent: 'space-between', p: 2, background: 'rgba(255,255,255,0.1)' }}>
                <Typography>底分: {score}</Typography>
                <Typography>在线: {Math.floor(Math.random() * 50)}</Typography>
              </Button>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RoomSelectionPage;
