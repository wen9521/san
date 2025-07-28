import React, { useState, useEffect } from 'react';
import { Button, Container, Typography, Box, Stack, CircularProgress } from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useNavigate } from 'react-router-dom';

import { useGame } from '../context/GameContext';
import PlayerStatus from '../components/PlayerStatus';
import { DroppableRow } from '../components/DroppableRow';
import { validateArrangement } from '../utils/thirteenLogic';
import '../styles/App.css';

const API_URL = 'https://9525.ip-ddns.com/api/deal.php';

function ThirteenGamePage() {
    const navigate = useNavigate();
    const { players, startGame, isGameActive, updatePlayerRows, autoArrangePlayerHand, setPlayerReady, calculateResults } = useGame();
    
    const player = players.find(p => p.id === 'player');
    const [rows, setRows] = useState(player?.rows || { front: [], middle: [], back: [] });
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [validationResult, setValidationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (player) {
            setRows(player.rows);
            // 每次牌墩变化时都重新验证
            const result = validateArrangement(player.rows);
            setValidationResult(result);
        }
    }, [player]); // 依赖 player 对象的变化

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

    const handleDealCards = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            if (data.success && data.hand.length === 52) {
                startGame(data.hand);
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
            if (rows[rowId].some(card => card.id === id)) {
                return rowId;
            }
        }
        return null;
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;
        
        const originalContainer = findContainer(active.id);
        const overContainer = over.id === 'front' || over.id === 'middle' || over.id === 'back' ? over.id : findContainer(over.id);

        if (!originalContainer || !overContainer || active.id === over.id) return;
        
        const newRows = JSON.parse(JSON.stringify(rows));
        const activeIndex = newRows[originalContainer].findIndex(c => c.id === active.id);
        if (activeIndex === -1) return;

        const [movedCard] = newRows[originalContainer].splice(activeIndex, 1);
        const overIndex = newRows[overContainer].findIndex(c => c.id === over.id);
        
        if (overIndex !== -1) {
            newRows[overContainer].splice(overIndex, 0, movedCard);
        } else {
            newRows[overContainer].push(movedCard);
        }

        const limits = { front: 3, middle: 5, back: 5 };
        if (newRows.front.length > limits.front || newRows.middle.length > limits.middle || newRows.back.length > limits.back) {
            return; // 超过上限，不更新状态
        }
        
        setRows(newRows); // 先更新本地UI
        updatePlayerRows(newRows); // 再更新全局Context
    };

    const handleCardClick = (cardId) => {
        setSelectedCardIds(prev => 
            prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
        );
    };
    
    const handleStartComparison = () => {
        if(validationResult?.isValid) {
            setPlayerReady();
            // 使用setTimeout确保state更新后执行
            setTimeout(() => {
                if(calculateResults()){
                    navigate('/comparison');
                }
            }, 50);
        } else {
            alert(validationResult?.message || "牌型不合法，请调整后再试。");
        }
    }

    if (!isGameActive) {
        return (
             <Container className="page-container">
                <Button variant="contained" size="large" onClick={handleDealCards} disabled={isLoading}>
                    {isLoading ? <CircularProgress size={24} color="inherit"/> : "开始四人牌局"}
                </Button>
            </Container>
        )
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Box className="page-container-new-ui">
                <Box className="game-board glass-effect">
                    {/* Top Bar */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1 }}>
                        {/* 【重要修正】: 移除了多余的 '<' 符号 */}
                        <Button variant="contained" sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}>退出房间</Button>
                        <Typography variant="h6">
                            <span role="img" aria-label="coin" style={{marginRight: '8px'}}>🪙</span>
                            积分: 100
                        </Typography>
                    </Box>
                    
                    {/* Player Status */}
                    <PlayerStatus />

                    {/* Card Rows */}
                    <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                        <DroppableRow id="front" label="头道 (3)" cards={rows.front} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="middle" label="中道 (5)" cards={rows.middle} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                        <DroppableRow id="back" label="后道 (5)" cards={rows.back} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} />
                    </Stack>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ p: 2 }}>
                        <Button variant="contained" color="secondary" sx={{ opacity: 0.8 }}>取消准备</Button>
                        <Button variant="contained" color="primary" onClick={autoArrangePlayerHand}>智能分牌</Button>
                        <Button variant="contained" sx={{ bgcolor: '#f57c00' }} onClick={handleStartComparison}>开始比牌</Button>
                    </Stack>
                </Box>
            </Box>
        </DndContext>
    );
}

export default ThirteenGamePage;
