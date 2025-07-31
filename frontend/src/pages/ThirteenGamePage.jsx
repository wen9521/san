import React, { useState, useEffect, useCallback } from 'react';
import { Button, Container, Typography, Box, Stack, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import { useGame } from '../context/GameContext';
import PlayerStatus from '../components/PlayerStatus';
import { GameRow } from '../components/GameRow';
import { sortCards } from '../utils/thirteenLogic';
import '../styles/App.css';

function ThirteenGamePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        players, isGameActive, startOfflineGame, updatePlayerRows,
        autoArrangePlayerHand, startComparison,
        dutouCurrent, dutouHistory, chooseDouScore, challengeDutou, openDutouDialog
    } = useGame();
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    
    const myId = 'player';
    const player = players.find(p => p.id === myId);

    // 【核心修复】添加加载守卫，确保player对象存在
    if (!player) {
        return (
             <Container className="page-container">
                <CircularProgress />
                <Typography sx={{color: 'white', mt: 2}}>正在创建十三张牌局...</Typography>
            </Container>
        );
    }
    
    // 只有当player存在时，才安全地解构rows
    const { rows } = player;

    useEffect(() => {
        if (location.state?.mode === 'offline' && !isGameActive) {
            startOfflineGame();
        }
    }, [location.state, isGameActive, startOfflineGame]);

    const handleDutouScoreClick = (dutouPlayerId) => {
        const challenger = players.find(p => p.id === myId);
        if (challenger) challengeDutou(dutouPlayerId, myId, challenger.name);
    };

    const handleExitGame = () => navigate('/');
    
    const handleStartComparison = () => {
        const result = startComparison();
        if (result.success) {
            navigate('/thirteen/comparison', { state: { results: result.results } });
        } else {
            alert(result.message || "牌型不合法或有玩家未准备好。");
        }
    };

    const handleCardClick = useCallback((cardId) => {
        setSelectedCardIds(prev => prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]);
    }, []);

    const handleRowClick = useCallback((targetRowId) => {
        if (selectedCardIds.length === 0) return;

        let newRows = JSON.parse(JSON.stringify(rows));
        let allPlayerCards = [...newRows.front, ...newRows.middle, ...newRows.back, ...player.hand];
        let movedCards = [];

        selectedCardIds.forEach(cardId => {
            let foundCard = allPlayerCards.find(c => c.id === cardId);
            if(foundCard) movedCards.push(foundCard);
        });

        // 从所有地方移除
        movedCards.forEach(cardToMove => {
            for (let row in newRows) {
                newRows[row] = newRows[row].filter(c => c.id !== cardToMove.id);
            }
            player.hand = player.hand.filter(c => c.id !== cardToMove.id);
        });

        newRows[targetRowId] = sortCards([...newRows[targetRowId], ...movedCards]);

        updatePlayerRows(newRows);
        setSelectedCardIds([]);
    }, [selectedCardIds, rows, player.hand, updatePlayerRows]);
    
    return (
        <Box className="page-container-new-ui">
            <Box className="game-board glass-effect">
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                    <Button variant="contained" onClick={handleExitGame} color="error">退出</Button>
                    <HandDisplay hand={player.hand} onCardClick={handleCardClick} selectedCardIds={selectedCardIds} />
                    <Typography>积分: 100</Typography>
                </Box>

                <PlayerStatus players={players} myId={myId} dutouCurrent={dutouCurrent} onDutouClick={openDutouDialog} onDutouScoreClick={handleDutouScoreClick} />
                
                <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                    <GameRow id="front" label="头道(3)" cards={rows.front} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} />
                    <GameRow id="middle" label="中道(5)" cards={rows.middle} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} />
                    <GameRow id="back" label="后道(5)" cards={rows.back} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} />
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
