import React, { useState } from 'react';
import { Button, Container, Typography, CircularProgress, Box, IconButton } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HandDisplay from '../components/HandDisplay';
import { Link } from 'react-router-dom';
import '../styles/App.css';

const API_URL = 'https://9525.ip-ddns.com/api/deal.php';

function ThirteenGamePage() {
  const [hand, setHand] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDealCards = async () => {
    setIsLoading(true);
    setError(null);
    setHand([]); 

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP 错误! 状态: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setTimeout(() => {
          setHand(data.hand);
        }, 100);
      } else {
        throw new Error('API返回失败');
      }
    } catch (e) {
      console.error("发牌失败:", e);
      setError('无法连接到发牌服务器，请检查后端或网络连接。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="page-container">
      <Box className="game-table glass-effect">
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <IconButton color="secondary">
              <ArrowBackIcon />
            </IconButton>
          </Link>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            十三张牌局
          </Typography>
          <Box sx={{ width: 40 }} /> {/* 占位，让标题居中 */}
        </Box>

        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          {isLoading ? (
            <CircularProgress color="primary" size={60} />
          ) : (
            <HandDisplay hand={hand} />
          )}
        </Box>
        
        {error && <Typography color="error" sx={{ my: 2 }}>{error}</Typography>}

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleDealCards}
          disabled={isLoading}
          startIcon={<CasinoIcon />}
          sx={{ fontWeight: 'bold', px: 5, py: 1.5, mt: 2 }}
        >
          {isLoading ? '正在洗牌...' : (hand.length > 0 ? '重新发牌' : '开始发牌')}
        </Button>
      </Box>
    </Container>
  );
}

export default ThirteenGamePage;