import React, { useState } from 'react';
import { Button, Container, Typography, CircularProgress, Box, AppBar, Toolbar } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino'; // 骰子图标
import HandDisplay from './components/HandDisplay';
import './styles/App.css';

// 后端API地址
const API_URL = 'https://9525.ip-ddns.com/api/deal.php';

function App() {
  const [hand, setHand] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDealCards = async () => {
    setIsLoading(true);
    setError(null);
    setHand([]); // 清空当前手牌，以重新触发动画

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP 错误! 状态: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        // 延迟一小段时间再设置手牌，确保CSS动画可以重新播放
        setTimeout(() => {
          setHand(data.hand);
        }, 100);
      } else {
        throw new Error('API返回失败');
      }
    } catch (e) {
      console.error("发牌失败:", e);
      setError('无法连接到发牌服务器，请检查后端服务是否正常。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <CasinoIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            十三张游戏 - 牌局演示
          </Typography>
        </Toolbar>
      </AppBar>

      <Container className="app-container">
        <Box className="poker-table">
          <Typography variant="h4" gutterBottom color="secondary">
            准备好开始了吗?
          </Typography>

          <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isLoading ? (
              <CircularProgress color="primary" />
            ) : (
              <HandDisplay hand={hand} />
            )}
          </Box>
          
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleDealCards}
            disabled={isLoading}
            startIcon={<CasinoIcon />}
            sx={{ mt: 4, fontWeight: 'bold', px: 5, py: 1.5 }}
          >
            {isLoading ? '正在洗牌...' : '发 牌'}
          </Button>
        </Box>
      </Container>
    </>
  );
}

export default App;