import React, { useContext, useState } from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthDialog from '../components/AuthDialog';
import PointsDialog from '../components/PointsDialog';
import { AuthContext } from '../context/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [showAuth, setShowAuth] = useState(false);
  const [showPoints, setShowPoints] = useState(false);

  // 顶部栏
  const TopBar = () => (
    <Box sx={{
      position: 'absolute',
      top: 0, left: 0, width: '100vw', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', zIndex: 99, px: 2, py: 1,
      background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(2px)'
    }}>
      <Box>
        {!user ? (
          <Button
            startIcon={<AccountCircleIcon />}
            variant="contained"
            size="small"
            onClick={() => setShowAuth(true)}
          >
            注册/登录
          </Button>
        ) : (
          <Button
            startIcon={<AccountCircleIcon />}
            variant="contained"
            size="small"
            color="error"
            onClick={logout}
          >
            退出登录
          </Button>
        )}
      </Box>
      <Box>
        <Button
          startIcon={<MonetizationOnIcon />}
          variant="outlined"
          size="small"
          color="success"
          onClick={() => setShowPoints(true)}
        >
          积分管理
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle, #3a5a40 0%, #1e2d2b 100%)',
        p: 2,
        position: 'relative'
      }}
    >
      <TopBar />
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
              <Button variant="contained" color="primary" size="large" onClick={() => navigate('/thirteen/play', { state: { mode: 'offline' } })}>+
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
              <Button variant="contained" sx={{ backgroundColor: '#0097a7', '&:hover': {backgroundColor: '#00838f'} }} size="large" onClick={() => navigate('/eight/play')}>+
                试玩
              </Button>
              <Button variant="outlined" color="secondary" size="large" disabled>
                选择房间
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <AuthDialog open={showAuth} onClose={() => setShowAuth(false)} />
      <PointsDialog open={showPoints} onClose={() => setShowPoints(false)} />
    </Box>
  );
};

export default HomePage;
