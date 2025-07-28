import React, { useState } from 'react';
import { Button, Container, Typography, Box, Stack, CircularProgress } from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';

import { useGame } from '../context/GameContext';
import PlayerStatus from '../components/PlayerStatus';
import { DroppableRow } from '../components/DroppableRow';
import { DraggableCard } from '../components/DraggableCard';
import { validateArrangement, sortCardsByRank } from '../utils/thirteenLogic';
import '../styles/App.css';

const API_URL = 'https://9525.ip-ddns.com/api/deal.php';

function ThirteenGamePage() {
    const navigate = useNavigate();
    // 从Context获取所有需要的状态和函数
    const { players, isGameActive, startGame, updatePlayerRows, autoArrangePlayerHand, setPlayerReady, calculateResults } = useGame();
    
    // 【核心修正 1】: 直接从Context派生出玩家和牌墩数据，不再使用本地useState
    const player = players.find(p => p.id === 'player');
    const rows = player?.rows || { front: [], middle: [], back: [] };
    const validationResult = player ? validateArrangement(player.rows) : null;

    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [activeDragId, setActiveDragId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

    const handleDealCards = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            if (data.success && data.hand.length === 52) {
                startGame(data.hand); // 启动游戏，Context将负责更新players状态
            } else {
                 throw new Error('获取的牌数不足52张');
            }
        } catch(e) {
            console.error("发牌失败:", e);
            // 可以在此设置一个错误状态来显示给用户
        } finally {
            setIsLoading(false);
        }
    };
    
    const findContainer = (id) => {
        for (const rowId in rows) {
            if (rows[rowId].some(card => card.id === id)) return rowId;
        }
        return null;
    };
    
    const handleCardClick = (cardId, rowId, event) => {
        event.stopPropagation();
        // 多选逻辑不变...
        if (event.shiftKey) {
            const row = rows[rowId];
            const lastSelectedId = selectedCardIds[selectedCardIds.length - 1];
            const lastSelectedIndex = lastSelectedId ? row.findIndex(c => c.id === lastSelectedId) : -1;
            const currentIndex = row.findIndex(c => c.id === cardId);
            if (lastSelectedIndex !== -1 && currentIndex !== -1) {
                const start = Math.min(lastSelectedIndex, currentIndex);
                const end = Math.max(lastSelectedIndex, currentIndex);
                const rangeIds = row.slice(start, end + 1).map(c => c.id);
                setSelectedCardIds([...new Set([...selectedCardIds, ...rangeIds])]);
            } else {
                 setSelectedCardIds(prev => [...prev, cardId]);
            }
        } else if (event.ctrlKey || event.metaKey) {
            setSelectedCardIds(prev => prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]);
        } else {
            setSelectedCardIds([cardId]);
        }
    };
    
    const handleDragStart = (event) => {
        setActiveDragId(event.active.id);
        if (!selectedCardIds.includes(event.active.id)) {
            setSelectedCardIds([event.active.id]);
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragId(null);
        if (!over) return;
        
        const originalContainer = findContainer(active.id);
        const overContainerId = over.id === 'front' || over.id === 'middle' || over.id === 'back' ? over.id : findContainer(over.id);

        if (!originalContainer || !overContainerId) return;

        const itemsToMove = selectedCardIds.includes(active.id) ? selectedCardIds : [active.id];
        const movedCardsData = [];
        
        // 【核心修正 2】: 直接基于当前的rows计算出新rows，然后调用Context的更新函数
        const newRows = JSON.parse(JSON.stringify(rows));

        itemsToMove.forEach(id => {
            const container = findContainer(id); // 需要用闭包前的findContainer
            if (container && newRows[container]) {
                const cardIndex = newRows[container].findIndex(c => c.id === id);
                if (cardIndex !== -1) {
                    movedCardsData.push(newRows[container][cardIndex]);
                    newRows[container].splice(cardIndex, 1);
                }
            }
        });
        
        const overIndex = newRows[overContainerId] ? newRows[overContainerId].findIndex(c => c.id === over.id) : -1;
        if(overIndex !== -1) {
             newRows[overContainerId].splice(overIndex, 0, ...movedCardsData);
        } else {
             newRows[overContainerId].push(...movedCardsData);
        }
        
        const limits = { front: 3, middle: 5, back: 5 };
        if (newRows.front.length > limits.front || newRows.middle.length > limits.middle || newRows.back.length > limits.back) {
            return;
        }

        newRows[overContainerId] = sortCardsByRank(newRows[overContainerId]);
        
        // 调用Context的函数来更新全局状态，而不是本地的setRows
        updatePlayerRows(newRows);
        setSelectedCardIds([]);
    };
    
    const handleStartComparison = () => {
        if (validationResult?.isValid) {
            const updatedPlayers = setPlayerReady();
            if (calculateResults(updatedPlayers)) {
                navigate('/comparison');
            }
        } else {
            alert(validationResult?.message || "牌型不合法，请调整后再试。");
        }
    };

    if (!isGameActive) {
        return (
             <Container className="page-container">
                <Button variant="contained" size="large" onClick={handleDealCards} disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} color="inherit"/> : "开始四人牌局"}
                </Button>
            </Container>
        )
    }

    const activeCardData = activeDragId ? player.hand.find(c => c.id === activeDragId) : null;

    return (
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <Box className="page-container-new-ui">
                <Box className="game-board glass-effect">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                        <Button variant="contained" sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}>退出房间</Button>
                        <Typography variant="h6">
                            <span role="img" aria-label="coin" style={{marginRight: '8px'}}>🪙</span>
                            积分: 100
                        </Typography>
                    </Box>
                    
                    <PlayerStatus />

                    <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                        <DroppableRow id="front" label="头道 (3)" cards={rows.front} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="middle" label="中道 (5)" cards={rows.middle} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="back" label="后道 (5)" cards={rows.back} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                    </Stack>

                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ p: 2 }}>
                        <Button variant="contained" color="secondary" sx={{ opacity: 0.8 }}>取消准备</Button>
                        <Button variant="contained" color="primary" onClick={autoArrangePlayerHand}>智能分牌</Button>
                        <Button variant="contained" sx={{ bgcolor: '#f57c00' }} onClick={handleStartComparison}>开始比牌</Button>
                    </Stack>
                </Box>
            </Box>
            <DragOverlay>
                {activeDragId && activeCardData ? (
                    <div style={{ display: 'flex', gap: '-45px' }}>
                       {selectedCardIds.map(id => {
                            const card = player.hand.find(c => c.id === id);
                            if (card) return <DraggableCard key={id} card={card} isSelected={false} onClick={()=>{}} />;
                            return null;
                       })}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default ThirteenGamePage;
