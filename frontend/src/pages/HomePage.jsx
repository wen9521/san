import React from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  // 【核心重构】: 导航函数现在只负责跳转和传递信号
  const handleThirteenOfflinePlay = () => {
    navigate('/thirteen/play', { state: { mode: 'offline' } });
  };
  
  const handleEightOfflinePlay = () => {
    navigate('/eight/play'); // 八张游戏目前默认就是离线模式
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle, #3a5a40 0%, #1e2d2b 100%)',
        p: 2,
      }}
    >
      <Grid container spacing={4} sx={{ maxWidth: '1200px' }}>
        {/* 十三张板块 */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'white',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#ffd700' }}>
              十三张
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="contained" color="primary" size="large" onClick={handleThirteenOfflinePlay}>
                试玩
              </Button>
              <Button variant="outlined" color="secondary" size="large" onClick={() => navigate('/rooms')}>
                选择房间
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* 八张板块 */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={6}
            sx={{
              p: 4,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'white',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#4dd0e1' }}>
              八张
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button variant="contained" sx={{ backgroundColor: '#0097a7', '&:hover': {backgroundColor: '#00838f'} }} size="large" onClick={handleEightOfflinePlay}>
                试玩
              </Button>
               <Button variant="outlined" color="secondary" size="large" disabled>
                选择房间
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
