import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useGame } from '../context/GameContext';
import '../styles/App.css'; 

const MiniCard = ({ card, zIndex }) => (
  <img 
    src={`/assets/cards/${card.id}.svg`} 
    alt={card.displayName}
    style={{
      width: '80px',
      height: 'auto',
      position: 'absolute',
      zIndex: zIndex,
      borderRadius: '4px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
    }}
  />
);

const StackedHand = ({ cards }) => {
  if (!cards || cards.length === 0) return null;
  return (
    <Box sx={{ 
      position: 'relative', 
      width: '80px',
      height: '112px',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      {cards.map((card, index) => (
        <MiniCard key={card.id} card={card} zIndex={index} />
      ))}
    </Box>
  );
};

const ComparisonPage = () => {
  const navigate = useNavigate();
  const { comparisonResult, players, resetGame } = useGame();

  // 在组件卸载时调用 resetGame，确保状态被清理
  useEffect(() => {
    return () => {
      resetGame();
    };
  }, [resetGame]);

  const handleReturnHome = () => {
    // 在导航前，不需要手动调用resetGame，因为卸载时会自动调用
    navigate('/'); 
  };
  
  if (!comparisonResult) {
    return (
      <Box className="page-container">
        <Typography variant="h5" color="white" gutterBottom>
          没有比牌结果可显示。
        </Typography>
        <Button variant="contained" onClick={handleReturnHome}>返回主页</Button>
      </Box>
    );
  }

  const enrichedPlayers = useMemo(() => {
    return players.map(player => {
      const result = comparisonResult.scores.find(s => s.playerId === player.id) || {};
      return {
        ...player,
        ...result,
        frontHand: player.rows.front,
        middleHand: player.rows.middle,
        backHand: player.rows.back
      };
    });
  }, [players, comparisonResult.scores]);

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        background: 'radial-gradient(circle, #2c4a3b 0%, #1a2a28 100%)',
        overflow: 'hidden',
        p: 2,
        boxSizing: 'border-box'
      }}
    >
      <Typography variant="h4" align="center" sx={{ color: '#ffd700', mb: 2, textShadow: '1px 1px 3px #000' }}>
        比牌结果
      </Typography>

      <Box 
        sx={{
          flexGrow: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: 2,
        }}
      >
        {enrichedPlayers.map(player => (
          <Paper 
            key={player.id}
            elevation={3}
            sx={{
              p: 2,
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255, 255, 255, 0.05)',
              border: `2px solid ${player.totalScore > 0 ? '#4caf50' : (player.totalScore < 0 ? '#f44336' : 'rgba(255,255,255,0.2)')}`,
              color: 'white',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">{player.name}</Typography>
              <Typography variant="h6" sx={{ color: player.totalScore > 0 ? '#66bb6a' : (player.totalScore < 0 ? '#ef5350' : 'white')}}>
                得分: {player.totalScore}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" display="block" align="center" gutterBottom>头道</Typography>
                <StackedHand cards={player.frontHand} />
                <Typography variant="body2" align="center" sx={{ mt: 1, color: '#b0bec5' }}>{player.front?.type || ''}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" display="block" align="center" gutterBottom>中道</Typography>
                <StackedHand cards={player.middleHand} />
                <Typography variant="body2" align="center" sx={{ mt: 1, color: '#b0bec5' }}>{player.middle?.type || ''}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" display="block" align="center" gutterBottom>后道</Typography>
                <StackedHand cards={player.backHand} />
                <Typography variant="body2" align="center" sx={{ mt: 1, color: '#b0bec5' }}>{player.back?.type || ''}</Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button variant="contained" size="large" onClick={handleReturnHome}>
          返回主页
        </Button>
      </Box>
    </Box>
  );
};

export default ComparisonPage;
