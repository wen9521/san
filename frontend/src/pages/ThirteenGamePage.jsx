import React, { useState, useEffect } from 'react';
import { Button, Container, Typography, Box, Stack, CircularProgress } from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { useLocation, useNavigate } from 'react-router-dom';

import { useGame } from '../context/GameContext';
import PlayerStatus from '../components/PlayerStatus';
import { DroppableRow } from '../components/DroppableRow';
import { validateArrangement, sortCardsByRank, findCardInRows } from '../utils/thirteenLogic';
import '../styles/App.css';

function ThirteenGamePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { players, isGameActive, startOfflineGame, resetGame, updatePlayerRows, autoArrangePlayerHand, setPlayerReady, calculateResults } = useGame();
    
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [activeDragId, setActiveDragId] = useState(null);
    
    const player = players.find(p => p.id === 'player');
    const rows = player?.rows || { front: [], middle: [], back: [] };
    const validationResult = player ? validateArrangement(player.rows) : null;

    useEffect(() => {
        if (location.state?.mode === 'offline') {
            startOfflineGame();
        }
        return () => {
            resetGame();
        };
    }, [location.state, startOfflineGame, resetGame]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleExitGame = () => {
        navigate('/');
    };
    
    const handleStartComparison = () => {
        if (validationResult?.isValid) {
            const updatedPlayers = setPlayerReady();
            if (calculateResults(updatedPlayers)) {
                navigate('/thirteen/comparison');
            }
        } else {
            alert(validationResult?.message || "牌型不合法，请调整后再试。");
        }
    };
    
    if (!isGameActive || !player) {
        return (
             <Container className="page-container">
                <CircularProgress />
                <Typography sx={{color: 'white', mt: 2}}>正在创建十三张牌局...</Typography>
            </Container>
        )
    }

    // ... (拖拽等其他逻辑保持不变)
    const activeCardForOverlay = activeDragId ? findCardInRows(rows, activeDragId) : null;
    const handleCardClick = (cardId) => setSelectedCardIds(prev => prev.includes(cardId) ? [] : [cardId]);
    const handleDragStart = (event) => setActiveDragId(event.active.id);
    const handleDragEnd = (event) => { /* ... */ };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Box className="page-container">
                <Box className="game-board">
                    {/* 顶部栏 */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                        <Button
                            variant="contained"
                            onClick={handleExitGame}
                            sx={{
                                background: 'rgba(255, 100, 100, 0.7)',
                                backdropFilter: 'blur(5px)',
                                '&:hover': { background: 'rgba(255, 100, 100, 0.9)'}
                            }}
                        >
                            &lt; 退出房间
                        </Button>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, p: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px'}}>
                            <Typography sx={{ color: '#ffd700', fontSize: '20px' }}>🪙</Typography>
                            <Typography>积分: 100</Typography>
                        </Box>
                    </Box>

                    <PlayerStatus players={players} />
                    
                    {/* 牌墩 */}
                    <Stack spacing={2}>
                        <DroppableRow id="front" label="头道 (3)" cards={rows.front} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="middle" label="中道 (5)" cards={rows.middle} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="back" label="后道 (5)" cards={rows.back} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                    </Stack>

                    {/* 底部按钮 */}
                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
                        <Button variant="contained" sx={{flex: 1, background: 'rgba(255,255,255,0.2)'}}>取消准备</Button>
                        <Button variant="contained" color="primary" sx={{flex: 1, background: '#1976d2' }} onClick={autoArrangePlayerHand}>智能分牌</Button>
                        <Button variant="contained" color="warning" sx={{flex: 1, background: '#f57c00'}} onClick={handleStartComparison}>开始比牌</Button>
                    </Stack>
                </Box>
            </Box>
            <DragOverlay>
                {activeCardForOverlay ? (
                    <div className="poker-card">
                         <img src={`/assets/cards/${activeCardForOverlay.id}.svg`} alt="card" style={{width: '100%', height: '100%'}}/>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default ThirteenGamePage;
