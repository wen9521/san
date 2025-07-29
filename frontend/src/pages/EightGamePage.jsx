import React, { useState, useEffect } from 'react';
import { Button, Box, Stack, Typography, CircularProgress, Container } from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';

// 【核心改造】: 引入并使用新的Context
import { useEightGame } from '../context/EightGameContext'; 
import PlayerStatus from '../components/PlayerStatus';
import { DroppableRow } from '../components/DroppableRow';
// 【核心改造】: 引入八张逻辑
import { validateEightArrangement, sortCardsByRank, findCardInRows } from '../utils/eightLogic';
import '../styles/App.css';

function EightGamePage() {
    const navigate = useNavigate();
    // 【核心改造】: 从Context获取所有状态和方法
    const { players, isGameActive, startGame, resetGame, updatePlayerRows, autoArrangePlayerHand } = useEightGame();
    
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [activeDragId, setActiveDragId] = useState(null);

    // 从 context 中派生出当前玩家的数据
    const player = players.find(p => p.id === 'player');
    const rows = player?.rows || { front: [], middle: [], back: [] };
    
    useEffect(() => {
        // 当组件加载时，自动开始游戏
        startGame();

        // 当组件卸载时，重置游戏状态
        return () => {
            resetGame();
        };
    }, [startGame, resetGame]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleStartComparison = () => {
        const validationResult = validateEightArrangement(rows);
        if (validationResult.isValid) {
            alert("牌型合法，准备比牌！(比牌逻辑后续实现)");
            // navigate('/eight/comparison');
        } else {
            alert(validationResult.message);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragId(null);
        if (!over || !player) return;
        
        const currentRows = player.rows;
        let newRows = JSON.parse(JSON.stringify(currentRows));
        
        // 找到被拖动的卡片及其来源
        const sourceRowId = Object.keys(currentRows).find(key => currentRows[key].some(c => c.id === active.id));
        const cardToMove = sourceRowId ? currentRows[sourceRowId].find(c => c.id === active.id) : null;

        if (!sourceRowId || !cardToMove) return;

        // 从原位置移除
        newRows[sourceRowId] = newRows[sourceRowId].filter(c => c.id !== active.id);
        
        // 添加到新位置
        const overRowId = over.id in newRows ? over.id : Object.keys(newRows).find(key => newRows[key].some(c => c.id === over.id));
        if (newRows[overRowId]) {
             newRows[overRowId].push(cardToMove);
             newRows[overRowId] = sortCardsByRank(newRows[overRowId]);
        }
        
        updatePlayerRows(newRows);
        setSelectedCardIds([]);
    };
    
    const handleDragStart = (event) => setActiveDragId(event.active.id);
    const handleCardClick = (cardId) => setSelectedCardIds(prev => prev.includes(cardId) ? [] : [cardId]);
    const activeCardForOverlay = activeDragId ? findCardInRows(rows, activeDragId) : null;

    if (!isGameActive || !player) {
        return (
            <Container className="page-container">
                <CircularProgress />
                <Typography sx={{ color: 'white', mt: 2 }}>正在创建六人牌局...</Typography>
            </Container>
        );
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Box className="page-container-new-ui">
                <Box className="game-board glass-effect">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                        <Button variant="contained" sx={{ bgcolor: 'error.main' }} onClick={() => navigate('/')}>退出游戏</Button>
                    </Box>
                    <PlayerStatus playerCount={6} />
                    <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                        <DroppableRow id="front" label="头道 (2)" cards={rows.front} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="middle" label="中道 (3)" cards={rows.middle} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="back" label="后道 (3)" cards={rows.back} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
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

export default EightGamePage;
