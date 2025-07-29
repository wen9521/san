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
    const location = useLocation(); // 获取导航状态
    const { players, isGameActive, startOfflineGame, resetGame, updatePlayerRows, autoArrangePlayerHand, setPlayerReady, calculateResults } = useGame();
    
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [activeDragId, setActiveDragId] = useState(null);
    
    // 从 context 中派生出当前玩家的数据
    const player = players.find(p => p.id === 'player');
    const rows = player?.rows || { front: [], middle: [], back: [] };
    const validationResult = player ? validateArrangement(player.rows) : null;

    useEffect(() => {
        // 【核心重构】: 根据导航状态启动不同模式的游戏
        if (location.state?.mode === 'offline') {
            startOfflineGame();
        }
        // 在线模式的启动逻辑可以放在这里，例如从服务器获取数据后调用 startOnlineGame

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
                navigate('/thirteen/comparison'); // 修正了导航路径
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
    const findContainerIdForCard = (cardId, currentRows) => {
        for (const rowId in currentRows) {
            if (currentRows[rowId].some(card => card.id === cardId)) return rowId;
        }
        return null;
    };
    const handleCardClick = (cardId) => setSelectedCardIds(prev => prev.includes(cardId) ? [] : [cardId]);
    const handleDragStart = (event) => setActiveDragId(event.active.id);
    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragId(null);
        if (!over) return;
        
        let newRows = JSON.parse(JSON.stringify(rows));
        const cardToMove = findCardInRows(newRows, active.id);
        const sourceRowId = Object.keys(newRows).find(key => newRows[key].some(c => c.id === active.id));
        
        if (sourceRowId) { newRows[sourceRowId] = newRows[sourceRowId].filter(c => c.id !== active.id); }
        
        const overRowId = over.id;
        if (newRows[overRowId] && cardToMove) {
             newRows[overRowId].push(cardToMove);
             newRows[overRowId] = sortCardsByRank(newRows[overRowId]);
        }
        
        if (newRows.front.length > 3 || newRows.middle.length > 5 || newRows.back.length > 5) {
            return; // 简单回退，不更新状态
        }

        updatePlayerRows(newRows);
        setSelectedCardIds([]);
    };

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Box className="page-container-new-ui">
                <Box className="game-board glass-effect">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                        <Button variant="contained" sx={{ bgcolor: 'error.main' }} onClick={handleExitGame}>退出游戏</Button>
                    </Box>
                    <PlayerStatus playerCount={4} />
                    <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                        <DroppableRow id="front" label="头道 (3)" cards={rows.front} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="middle" label="中道 (5)" cards={rows.middle} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="back" label="后道 (5)" cards={rows.back} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                    </Stack>
                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ p: 2 }}>
                        <Button variant="contained" color="primary" onClick={autoArrangePlayerHand}>智能分牌</Button>
                        <Button variant="contained" color="success" onClick={handleStartComparison}>开始比牌</Button>
                    </Stack>
                </Box>
            </Box>
            <DragOverlay>
                {activeCardForOverlay ? (
                    <div className="poker-card" style={{ width: '120px', height: '168px' }}>
                         <img src={`/assets/cards/${activeCardForOverlay.id}.svg`} alt="card" style={{width: '100%', height: '100%'}}/>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default ThirteenGamePage;
