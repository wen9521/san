import React, { useState } from 'react';
import { Button, Container, Typography, Box, Stack, CircularProgress } from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';

import { useGame } from '../context/GameContext';
import PlayerStatus from '../components/PlayerStatus';
import { DroppableRow } from '../components/DroppableRow';
import { DraggableCard } from '../components/DraggableCard';
import { validateArrangement, sortCardsByRank, findCardInRows } from '../utils/thirteenLogic';
import '../styles/App.css';

const API_URL = 'https://9525.ip-ddns.com/api/deal.php';

function ThirteenGamePage() {
    const navigate = useNavigate();
    const { players, isGameActive, startGame, updatePlayerRows, autoArrangePlayerHand, setPlayerReady, calculateResults } = useGame();
    
    const player = players.find(p => p.id === 'player');
    const rows = player?.rows || { front: [], middle: [], back: [] };
    const validationResult = player ? validateArrangement(player.rows) : null;

    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [activeDragId, setActiveDragId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // 【核心修正】: 配置传感器，解决点击和拖拽冲突
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 拖动超过8px才算作拖拽，以允许点击
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleDealCards = async () => { /* ... 此函数不变 ... */ };

    const findContainer = (id) => {
        for (const rowId in rows) {
            if (rows[rowId].some(card => card.id === id)) return rowId;
        }
        return null;
    };
    
    const handleCardClick = (cardId, rowId, event) => {
        event.stopPropagation();
        if (event.shiftKey) { /* ... Shift多选逻辑不变 ... */ } 
        else if (event.ctrlKey || event.metaKey) {
            setSelectedCardIds(prev => prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]);
        } else {
            setSelectedCardIds(prev => (prev.length === 1 && prev[0] === cardId) ? [] : [cardId]);
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
        if (!over) {
            setSelectedCardIds([]);
            return;
        };
        
        const overContainerId = over.id in rows ? over.id : findContainer(over.id);
        if (!overContainerId) {
             setSelectedCardIds([]);
             return;
        }

        const itemsToMove = selectedCardIds.includes(active.id) ? [...selectedCardIds] : [active.id];
        
        let newRows = JSON.parse(JSON.stringify(rows));
        const movedCardsData = [];

        // 1. 从原位置安全地移除
        itemsToMove.forEach(id => {
            const containerId = findContainer(id);
            if (containerId) {
                const cardIndex = newRows[containerId].findIndex(c => c.id === id);
                if (cardIndex !== -1) {
                    movedCardsData.push(newRows[containerId][cardIndex]);
                    newRows[containerId].splice(cardIndex, 1);
                }
            }
        });
        
        // 2. 添加到新位置
        const overCardIndex = newRows[overContainerId].findIndex(c => c.id === over.id);
        const insertIndex = overCardIndex !== -1 ? overCardIndex : newRows[overContainerId].length;
        newRows[overContainerId].splice(insertIndex, 0, ...movedCardsData);

        // 3. 验证牌墩数量
        const limits = { front: 3, middle: 5, back: 5 };
        if (newRows.front.length > limits.front || newRows.middle.length > limits.middle || newRows.back.length > limits.back) {
            setSelectedCardIds([]);
            return; // 移动无效，不更新状态，直接返回
        }
        
        // 4. 对发生改变的牌墩进行排序
        newRows[overContainerId] = sortCardsByRank(newRows[overContainerId]);
        const originalContainers = [...new Set(itemsToMove.map(id => findContainer(id)))];
        originalContainers.forEach(containerId => {
            if (containerId && containerId !== overContainerId) {
                newRows[containerId] = sortCardsByRank(newRows[containerId]);
            }
        });

        updatePlayerRows(newRows);
        setSelectedCardIds([]);
    };

    const handleStartComparison = () => { /* ... 此函数不变 ... */ };

    if (!isGameActive) { /* ... 此部分不变 ... */ }

    // 【核心修正】: DragOverlay的渲染逻辑
    const draggedCards = selectedCardIds.map(id => findCardInRows(rows, id)).filter(Boolean);
    const activeCard = activeDragId ? findCardInRows(rows, activeDragId) : null;
    
    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <Box className="page-container-new-ui">
                <Box className="game-board glass-effect">
                    {/* ... (Top Bar 和 PlayerStatus 不变) ... */}
                    <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                        <DroppableRow id="front" label="头道 (3)" cards={rows.front} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="middle" label="中道 (5)" cards={rows.middle} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="back" label="后道 (5)" cards={rows.back} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                    </Stack>
                    {/* ... (Action Buttons 不变) ... */}
                </Box>
            </Box>
            <DragOverlay dropAnimation={null}>
                {activeDragId ? (
                    <div style={{ display: 'flex', marginLeft: `${-45 * (draggedCards.findIndex(c=>c.id === activeDragId) || 0)}px`}}>
                       {draggedCards.length > 0 ? draggedCards.map(card => (
                           <div key={card.id} className="poker-card" style={{ marginLeft: '-45px' }}>
                               <img src={`/assets/cards/${card.id}.svg`} alt={card.displayName} />
                           </div>
                       )) : (activeCard && 
                           <div className="poker-card">
                               <img src={`/assets/cards/${activeCard.id}.svg`} alt={activeCard.displayName} />
                           </div>
                       )}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default ThirteenGamePage;
