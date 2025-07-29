import React, { useState, useEffect, useCallback } from 'react';
import { Button, Container, Typography, Box, Stack, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import { useGame } from '../context/GameContext';
import PlayerStatus from '../components/PlayerStatus';
import { GameRow } from '../components/GameRow'; // 使用新的 GameRow 组件
import { sortCardsByRank } from '../utils/thirteenLogic'; // 仅保留 sortCardsByRank，因为 findCardInRows 将不再需要直接在页面中使用
import '../styles/App.css';

function ThirteenGamePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { players, isGameActive, startOfflineGame, resetGame, updatePlayerRows, autoArrangePlayerHand, startComparison } = useGame();
    
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    
    const player = players.find(p => p.id === 'player');
    const rows = player?.rows || { front: [], middle: [], back: [] };
    
    useEffect(() => {
        if (location.state?.mode === 'offline') {
            startOfflineGame();
        }
        
        return () => {
            resetGame();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExitGame = () => {
        navigate('/');
    };
    
    const handleStartComparison = () => {
        const result = startComparison();
        if (result.success) {
            navigate('/thirteen/comparison');
        } else {
            alert(result.message || "牌型不合法，请调整后再试。");
        }
    };

    const handleCardClick = useCallback((cardId) => {
        setSelectedCardIds(prev => {
            if (prev.includes(cardId)) {
                return prev.filter(id => id !== cardId); // Deselect
            } else {
                return [...prev, cardId]; // Select
            }
        });
    }, []);

    const handleRowClick = useCallback((targetRowId) => {
        if (selectedCardIds.length === 0) return; // 没有选中的牌，不执行任何操作

        let newRows = JSON.parse(JSON.stringify(rows)); // 深拷贝当前牌墩状态
        let movedCards = [];

        // 遍历所有选中的牌ID
        selectedCardIds.forEach(cardId => {
            let foundCard = null;
            let originalRowId = null;

            // 从现有牌墩中找到选中的牌并移除它
            for (const rowId in newRows) {
                const index = newRows[rowId].findIndex(c => c.id === cardId);
                if (index !== -1) {
                    foundCard = newRows[rowId][index];
                    newRows[rowId].splice(index, 1); // 从原牌墩中移除
                    originalRowId = rowId;
                    break;
                }
            }
            if (foundCard) {
                movedCards.push(foundCard);
            }
        });

        // 将所有移动的牌添加到目标牌墩，并重新排序
        newRows[targetRowId] = sortCardsByRank([...newRows[targetRowId], ...movedCards]);

        updatePlayerRows(newRows); // 更新全局游戏状态
        setSelectedCardIds([]); // 清空选中状态
    }, [selectedCardIds, rows, updatePlayerRows]);

    if (!isGameActive || !player) {
        return (
             <Container className="page-container">
                <CircularProgress />
                <Typography sx={{color: 'white', mt: 2}}>正在创建十三张牌局...</Typography>
            </Container>
        )
    }

    return (
        <Box className="page-container-new-ui">
            <Box className="game-board glass-effect">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                    <Button
                        variant="contained"
                        onClick={handleExitGame}
                        sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
                    >
                        退出游戏
                    </Button>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, p: '4px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '20px'}}>
                        <Typography sx={{ color: '#ffd700', fontSize: '20px' }}>🪙</Typography>
                        <Typography>积分: 100</Typography>
                    </Box>
                </Box>
                <PlayerStatus players={players} />
                <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                    <GameRow id="front" label="头道 (3)" cards={rows.front} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} onRowClick={handleRowClick} />
                    <GameRow id="middle" label="中道 (5)" cards={rows.middle} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} onRowClick={handleRowClick} />
                    <GameRow id="back" label="后道 (5)" cards={rows.back} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} onRowClick={handleRowClick} />
                </Stack>
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ p: 2 }}>
                    <Button variant="contained" color="primary" onClick={autoArrangePlayerHand}>智能分牌</Button>
                    <Button variant="contained" color="success" onClick={handleStartComparison}>开始比牌</Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default ThirteenGamePage;
