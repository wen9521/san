import React, { useContext, useState } from 'react';
import { Box, Typography, Button, Paper, Grid, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuthDialog from '../components/AuthDialog';
import PointsDialog from '../components/PointsDialog';
import { AuthContext } from '../context/AuthContext';
import MenuIcon from '@mui/icons-material/Menu';
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

  // 主页内容略
  // ... 保持原有内容
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
      <Grid container spacing={4} sx={{ maxWidth: '1200px' }}>
        {/* ...原十三张与八张内容不变 */}
        {/* ...（略） */}
      </Grid>
      <AuthDialog open={showAuth} onClose={() => setShowAuth(false)} />
      <PointsDialog open={showPoints} onClose={() => setShowPoints(false)} />
    </Box>
  );
};

export default HomePage;
