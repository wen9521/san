import React, { useState, useEffect, useCallback } from 'react';
import { Button, Box, Stack, Typography, CircularProgress, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useEightGame } from '../context/EightGameContext'; 
import PlayerStatus from '../components/PlayerStatus';
import { GameRow } from '../components/GameRow'; // 使用新的 GameRow 组件
import { validateEightArrangement, sortCardsByRank } from '../utils/eightLogic';
import '../styles/App.css';

function EightGamePage() {
    const navigate = useNavigate();
    const { players, isGameActive, startGame, resetGame, updatePlayerRows, autoArrangePlayerHand } = useEightGame();
    
    const [selectedCardIds, setSelectedCardIds] = useState([]);

    const player = players.find(p => p.id === 'player');
    const rows = player?.rows || { front: [], middle: [], back: [] };
    
    useEffect(() => {
        startGame();
        return () => {
            resetGame();
        };
    }, [startGame, resetGame]);

    const handleStartComparison = () => {
        const validationResult = validateEightArrangement(rows);
        if (validationResult.isValid) {
            alert("牌型合法，准备比牌！(比牌逻辑后续实现)");
        } else {
            alert(validationResult.message);
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
                <Typography sx={{ color: 'white', mt: 2 }}>正在创建六人牌局...</Typography>
            </Container>
        );
    }

    return (
        <Box className="page-container-new-ui">
            <Box className="game-board glass-effect">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                    <Button variant="contained" sx={{ bgcolor: 'error.main' }} onClick={() => navigate('/')}>退出游戏</Button>
                </Box>
                <PlayerStatus players={players} />
                <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                    <GameRow id="front" label="头道 (2)" cards={rows.front} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} onRowClick={handleRowClick} />
                    <GameRow id="middle" label="中道 (3)" cards={rows.middle} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} onRowClick={handleRowClick} />
                    <GameRow id="back" label="后道 (3)" cards={rows.back} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} onRowClick={handleRowClick} />
                </Stack>
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ p: 2 }}>
                    <Button variant="contained" color="primary" onClick={autoArrangePlayerHand}>智能分牌</Button>
                    <Button variant="contained" color="success" onClick={handleStartComparison}>开始比牌</Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default EightGamePage;
