import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import HandDisplay from '../components/HandDisplay';
import { useEightGame } from '../context/EightGameContext';
import { validateEightArrangement, checkForSpecialHand, calculateTotalScore } from '../utils/eightLogic';
import SpecialHandDialog from '../components/SpecialHandDialog';

// 【已修复】将理牌区的点击处理函数传入
function ClassicEightTable({ players, highlightId, editableRows, onConfirm, confirmEnabled, onSelectCard, selectedCard, onPlaceCard }) {
  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Stack direction="row" spacing={2} justifyContent="center" alignItems="flex-start">
        {players.map((player) => (
          <Paper
            key={player.id}
            sx={{
              p: 2,
              minWidth: 320, // 增大了宽度以适应布局
              minHeight: 250,
              background: player.id === highlightId ? 'rgba(255,255,200,0.13)' : 'rgba(255,255,255,0.05)',
              border: player.id === highlightId ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.2)',
              boxShadow: player.id === highlightId ? '0 0 10px #ffd700' : '',
            }}
          >
            <Typography align="center" variant="subtitle1" sx={{ mb: 1, color: player.id === highlightId ? '#ffd700' : '#fff', fontWeight: 'bold' }}>
              {player.name}
            </Typography>
            {player.id === highlightId ? (
              <>
                <Typography color="primary" sx={{ mb: 1 }}>点击手牌进行选择</Typography>
                {/* 【已修复】传入 onCardClick 和 selectedCard */}
                <HandDisplay hand={player.hand} onCardClick={onSelectCard} selectedCard={selectedCard} />

                <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                  {/* 【已修复】为每个理牌区添加点击事件 */}
                  <Box onClick={() => onPlaceCard('front')} sx={{ p: 1, border: '1px dashed grey', borderRadius: 1, cursor: 'pointer' }}>
                    <Typography>头道 (2)</Typography>
                    <HandDisplay hand={editableRows.front} />
                  </Box>
                  <Box onClick={() => onPlaceCard('middle')} sx={{ p: 1, border: '1px dashed grey', borderRadius: 1, cursor: 'pointer' }}>
                    <Typography>中道 (3)</Typography>
                    <HandDisplay hand={editableRows.middle} />
                  </Box>
                  <Box onClick={() => onPlaceCard('back')} sx={{ p: 1, border: '1px dashed grey', borderRadius: 1, cursor: 'pointer' }}>
                    <Typography>后道 (3)</Typography>
                    <HandDisplay hand={editableRows.back} />
                  </Box>
                </Box>
                <Button sx={{ mt: 2, width: '100%' }} variant="contained" disabled={!confirmEnabled} onClick={onConfirm}>确认分牌</Button>
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="caption">头道: {player.rows?.frontType || '未知'}</Typography>
                  <HandDisplay hand={player.rows?.front || []} />
                  <Typography variant="caption">中道: {player.rows?.middleType || '未知'}</Typography>
                  <HandDisplay hand={player.rows?.middle || []} />
                  <Typography variant="caption">后道: {player.rows?.backType || '未知'}</Typography>
                  <HandDisplay hand={player.rows?.back || []} />
              </Box>
            )}
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}

function ComparisonDialog({ open, players, mainPlayerId, onRestart }) {
    if (!open) return null;

    const mainPlayer = players.find(p => p.id === mainPlayerId);
    const aiPlayer = players.find(p => p.id !== mainPlayerId);
  
    if (!mainPlayer || !aiPlayer) {
      return (
        <Dialog open={open} fullWidth>
            <DialogTitle>等待玩家数据...</DialogTitle>
        </Dialog>
      );
    }
  
    const result = calculateTotalScore(mainPlayer.rows, aiPlayer.rows);
  
    return (
      <Dialog open={open} fullWidth maxWidth="md">
        <DialogTitle align="center">比牌结果</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2} justifyContent="center">
            {[mainPlayer, aiPlayer].map(p => (
              <Paper key={p.id} sx={{ p: 2, flex: 1 }}>
                <Typography align="center" variant="h6">{p.name}</Typography>
                <Stack spacing={1} sx={{mt: 1}}>
                  <Box>
                    <Chip label={`头道: ${p.rows.frontType}`} size="small" />
                    <HandDisplay hand={p.rows.front} />
                  </Box>
                  <Box>
                    <Chip label={`中道: ${p.rows.middleType}`} size="small" />
                    <HandDisplay hand={p.rows.middle} />
                  </Box>
                  <Box>
                    <Chip label={`后道: ${p.rows.backType}`} size="small" />
                    <HandDisplay hand={p.rows.back} />
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="h5" color={result.playerAScore > 0 ? "success.main" : "error.main"}>
              {result.playerAScore > 0 ? `你赢了！总得 +${result.playerAScore} 水` : `你输了！总得 ${result.playerAScore} 水`}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: '#aaa' }}>
              {result.breakdown.map(b => `【${b.rowName}】${b.message}`).join(' ')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onRestart} variant="contained" size="large">再玩一局</Button>
        </DialogActions>
      </Dialog>
    );
}

const EightGamePage = () => {
  const { players, currentPlayer, setPlayerArrangement, startGame } = useEightGame();
  const [rows, setRows] = useState({ front: [], middle: [], back: [] });
  const [isValid, setIsValid] = useState(false);
  const [specialHand, setSpecialHand] = useState(null);
  const [showSpecialDialog, setShowSpecialDialog] = useState(false);
  const [allReady, setAllReady] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null); // 【新增】

  useEffect(() => {
    if (currentPlayer?.hand) {
        setRows({ front: [], middle: [], back: [] });
        setIsValid(false);
        setAllReady(false);
        setSelectedCard(null);
        
        const detectedSpecial = checkForSpecialHand(currentPlayer.hand);
        if (detectedSpecial) {
            setSpecialHand(detectedSpecial);
            setShowSpecialDialog(true);
        } else {
            setSpecialHand(null);
            setShowSpecialDialog(false);
        }
    }
  }, [currentPlayer]);

  useEffect(() => {
    if (players.length > 0 && players.every(p => p.isReady)) {
      setAllReady(true);
    }
  }, [players]);

  // 【已修复】理牌逻辑拆分
  const handleSelectCard = (card) => {
    setSelectedCard(card.id === selectedCard?.id ? null : card); // 再次点击取消选择
  };
  
  const handlePlaceCard = (targetRow) => {
    if (!selectedCard) return; // 如果没有选中的牌，则不执行任何操作

    // 从所有手牌和牌道中移除该卡牌
    const remainingHand = currentPlayer.hand.filter(c => c.id !== selectedCard.id);
    let newRows = { ...rows };
    Object.keys(newRows).forEach(row => {
        newRows[row] = newRows[row].filter(c => c.id !== selectedCard.id);
    });

    // 将卡牌添加到目标牌道
    newRows[targetRow] = [...newRows[targetRow], selectedCard];

    setRows(newRows);
    setIsValid(validateEightArrangement(newRows).isValid);
    setSelectedCard(null); // 放置后取消选择
  };

  const handleConfirm = () => {
    const validation = validateEightArrangement(rows);
    if (validation.isValid) {
      setPlayerArrangement(currentPlayer.id, rows);
    } else {
      alert(validation.message || "分牌不合法，请检查！");
    }
  };

  const handleRestart = () => {
    startGame();
  };

  if (!currentPlayer) {
    return <Typography sx={{ color: 'white', mt: 2 }}>正在加载...</Typography>;
  }

  return (
    <Box sx={{ background: 'linear-gradient(to bottom, #232526, #414345)', minHeight: '100vh', color: 'white', p: 2 }}>
      {allReady ? (
        <ComparisonDialog open={allReady} players={players} mainPlayerId={currentPlayer.id} onRestart={handleRestart} />
      ) : (
        <>
          <Typography variant="h4" align="center">八张牌游戏</Typography>
          <ClassicEightTable
            players={players}
            highlightId={currentPlayer.id}
            editableRows={rows}
            onConfirm={handleConfirm}
            confirmEnabled={isValid}
            onSelectCard={handleSelectCard}
            selectedCard={selectedCard}
            onPlaceCard={handlePlaceCard}
          />
          <SpecialHandDialog open={showSpecialDialog} specialHandName={specialHand?.name} onClose={() => setShowSpecialDialog(false)} onConfirm={() => setShowSpecialDialog(false)} />
          <Box sx={{ mt: 3, textAlign: 'center', color: '#bbb' }}>
            <Typography>玩法: 先点击你的手牌, 再点击目标牌道(头/中/后)进行分配。</Typography>
            {selectedCard && <Typography color="primary">已选择: {selectedCard.id.replace('_', ' ')}</Typography>}
          </Box>
        </>
      )}
    </Box>
  );
};

export default EightGamePage;
