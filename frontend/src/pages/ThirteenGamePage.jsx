import React, { useState, useEffect } from 'react';
import { Button, Container, Typography, Box, Stack, CircularProgress } from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';

import { useGame } from '../context/GameContext';
import PlayerStatus from '../components/PlayerStatus';
import { DroppableRow } from '../components/DroppableRow';
import { DraggableCard } from '../components/DraggableCard'; // 用于拖拽覆盖层
import { validateArrangement, sortCardsByRank } from '../utils/thirteenLogic';
import '../styles/App.css';

const API_URL = 'https://9525.ip-ddns.com/api/deal.php';

function ThirteenGamePage() {
    const navigate = useNavigate();
    const { players, startGame, isGameActive, updatePlayerRows, autoArrangePlayerHand, setPlayerReady, calculateResults } = useGame();
    
    const player = players.find(p => p.id === 'player');
    const [rows, setRows] = useState(player?.rows || { front: [], middle: [], back: [] });
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [activeDragId, setActiveDragId] = useState(null); // 追踪正在拖拽的卡片
    const [validationResult, setValidationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (player) {
            setRows(player.rows);
            setValidationResult(validateArrangement(player.rows));
        }
    }, [player]);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

    const handleDealCards = async () => { /* ... 此函数不变 ... */ };

    const findContainer = (id) => {
        for (const rowId in rows) {
            if (rows[rowId].some(card => card.id === id)) return rowId;
        }
        return null;
    };
    
    // 多选逻辑
    const handleCardClick = (cardId, rowId, event) => {
        event.stopPropagation();
        if (event.shiftKey) { // 按住Shift进行范围选择
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
        } else if (event.ctrlKey || event.metaKey) { // 按住Ctrl/Cmd进行单点加/减选
            setSelectedCardIds(prev => 
                prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
            );
        } else { // 普通单击
            setSelectedCardIds([cardId]);
        }
    };
    
    // --- 拖拽核心逻辑 ---
    const handleDragStart = (event) => {
        setActiveDragId(event.active.id);
        // 如果拖拽的卡片未被选中，则清空其他选中，只选中当前拖拽的卡片
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
        
        const nextRows = JSON.parse(JSON.stringify(rows));

        // 1. 从原位置移除所有要移动的卡片
        itemsToMove.forEach(id => {
            const container = findContainer(id);
            if (container) {
                const cardIndex = nextRows[container].findIndex(c => c.id === id);
                if (cardIndex !== -1) {
                    movedCardsData.push(nextRows[container][cardIndex]);
                    nextRows[container].splice(cardIndex, 1);
                }
            }
        });

        // 2. 将卡片添加到新位置
        const overIndex = over.id in nextRows[overContainerId] ? nextRows[overContainerId].findIndex(c => c.id === over.id) : nextRows[overContainerId].length;
        nextRows[overContainerId].splice(overIndex, 0, ...movedCardsData);
        
        // 3. 验证牌墩数量
        const limits = { front: 3, middle: 5, back: 5 };
        if (nextRows.front.length > limits.front || nextRows.middle.length > limits.middle || nextRows.back.length > limits.back) {
            return; // 移动无效，不更新状态
        }

        // 4. 对新牌墩排序并更新状态
        nextRows[overContainerId] = sortCardsByRank(nextRows[overContainerId]);
        setRows(nextRows);
        updatePlayerRows(nextRows);
        setSelectedCardIds([]); // 拖拽结束后清空选择
    };
    
    const handleStartComparison = () => {
        if (validationResult?.isValid) {
            const updatedPlayers = setPlayerReady(); // 获取同步更新后的状态
            if (calculateResults(updatedPlayers)) { // 传入新状态进行计算
                navigate('/comparison');
            }
        } else {
            alert(validationResult?.message || "牌型不合法，请调整后再试。");
        }
    };

    // ... (其他函数: autoArrangePlayerHand, etc. 保持不变) ...

    if (!isGameActive) { /* ... 此部分不变 ... */ }

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
                    {/* ... (Top Bar 和 PlayerStatus 不变) ... */}
                    <PlayerStatus />

                    <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                        <DroppableRow id="front" label="头道 (3)" cards={rows.front} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="middle" label="中道 (5)" cards={rows.middle} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="back" label="后道 (5)" cards={rows.back} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                    </Stack>
                    
                    {/* ... (Action Buttons 不变) ... */}
                </Box>
            </Box>
            <DragOverlay>
                {activeDragId && activeCardData ? (
                    <div style={{ display: 'flex' }}>
                       {/* 显示所有被选中的卡片作为拖拽预览 */}
                       {selectedCardIds.map(id => {
                            const card = player.hand.find(c => c.id === id);
                            return <DraggableCard key={id} card={card} />;
                       })}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default ThirteenGamePage;
