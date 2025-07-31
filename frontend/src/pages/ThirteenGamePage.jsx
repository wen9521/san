import React, { useState, useEffect, useCallback } from 'react';
import { Button, Container, Typography, Box, Stack, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import { useGame } from '../context/GameContext';
import PlayerStatus from '../components/PlayerStatus';
import { GameRow } from '../components/GameRow';
import { sortCardsByRank } from '../utils/thirteenLogic';
import '../styles/App.css';

function ThirteenGamePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        players, isGameActive, startOfflineGame, resetGame, updatePlayerRows,
        autoArrangePlayerHand, startComparison,
        dutouCurrent, dutouHistory, chooseDutouScore, challengeDutou, openDutouDialog
    } = useGame();
    const [selectedCardIds, setSelectedCardIds] = useState([]);

    const myId = 'player';
    const player = players.find(p => p.id === myId);
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

    const handleDutouScoreClick = (dutouPlayerId, score) => {
        if (dutouPlayerId === myId) return; // 不能应战自己的独头
        const challenger = players.find(p => p.id === myId);
        if (challenger) {
             challengeDutou(dutouPlayerId, myId, challenger.name);
        }
    };

    const handleExitGame = () => {
        navigate('/');
    };
    
    // 【已修改】
    const handleStartComparison = () => {
        const result = startComparison();
        if (result.success) {
            // 将比牌结果通过 state 直接传递给下一页
            navigate('/thirteen/comparison', { state: { results: result.results } });
        } else {
            alert(result.message || "牌型不合法，请调整后再试。");
        }
    };

    const handleCardClick = useCallback((cardId) => {
        setSelectedCardIds(prev => {
            if (prev.includes(cardId)) {
                return prev.filter(id => id !== cardId);
            } else {
                return [...prev, cardId];
            }
        });
    }, []);

    const handleRowClick = useCallback((targetRowId) => {
        if (selectedCardIds.length === 0) return;

        let newRows = JSON.parse(JSON.stringify(rows));
        let movedCards = [];

        selectedCardIds.forEach(cardId => {
            let foundCard = null;
            for (const rowId in newRows) {
                const index = newRows[rowId].findIndex(c => c.id === cardId);
                if (index !== -1) {
                    foundCard = newRows[rowId][index];
                    newRows[rowId].splice(index, 1);
                    break;
                }
            }
            if (foundCard) {
                movedCards.push(foundCard);
            }
        });

        newRows[targetRowId] = sortCardsByRank([...newRows[targetRowId], ...movedCards]);

        updatePlayerRows(newRows);
        setSelectedCardIds([]);
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
                <PlayerStatus
                    players={players}
                    myId={myId}
                    dutouCurrent={dutouCurrent}
                    dutouHistory={dutouHistory}
                    onDutouClick={openDutouDialog}
                    onDutouScoreClick={handleDutouScoreClick}
                />
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
