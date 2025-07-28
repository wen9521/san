import React, { useState, useEffect } from 'react';
import { Button, Container, Typography, Box, Stack } from '@mui/material';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';

import { useGame } from '../context/GameContext';
import PlayerStatus from '../components/PlayerStatus';
import { DroppableRow } from '../components/DroppableRow';
import { validateArrangement } from '../utils/thirteenLogic';
import '../styles/App.css';

// ... (API_URL 和其他常量) ...
const API_URL = 'https://9525.ip-ddns.com/api/deal.php';

function ThirteenGamePage() {
    const navigate = useNavigate();
    const { players, startGame, isGameActive, updatePlayerRows, autoArrangePlayerHand, setPlayerReady } = useGame();
    
    const player = players.find(p => p.id === 'player');
    const [rows, setRows] = useState(player?.rows || { front: [], middle: [], back: [] });
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [validationResult, setValidationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (player) {
            setRows(player.rows);
            setValidationResult(validateArrangement(player.rows));
        }
    }, [players]);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

    const handleDealCards = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            if (data.success && data.hand.length === 52) {
                startGame(data.hand);
            } else {
                 // Handle error or unexpected response
                 console.error("Failed to deal cards or received unexpected data:", data);
                 alert("发牌失败，请稍后再试。"); // Provide user feedback
            }
        } catch (error) {
            console.error("Error fetching cards:", error);
            alert("发牌过程中发生错误，请检查网络连接。"); // Provide user feedback
        } finally {
            setIsLoading(false);
        }
    };
    
    const findContainer = (id) => {
        if (Object.keys(rows).find(key => rows[key].find(card => card.id === id))) {
            return Object.keys(rows).find(key => rows[key].find(card => card.id === id));
        }
        return null;
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;
        
        const activeId = active.id;
        const overId = over.id;

        const originalContainer = findContainer(activeId);
        const overContainer = findContainer(overId) || overId;

        if (!originalContainer || !overContainer || originalContainer === overContainer) {
            return; // Prevent dragging within the same container or invalid drops
        }

        setRows(prevRows => {
            const newRows = { ...prevRows };
            const cardToMove = newRows[originalContainer].find(card => card.id === activeId);
            if (!cardToMove) return prevRows; // Should not happen but safety check

            // Remove from original container
            newRows[originalContainer] = newRows[originalContainer].filter(card => card.id !== activeId);

            // Add to over container - handle dropping onto a row or a card within a row
            const overCardIndex = newRows[overContainer].findIndex(card => card.id === overId);
            if (overCardIndex !== -1) {
                newRows[overContainer].splice(overCardIndex, 0, cardToMove);
            } else if (overContainer === 'front' || overContainer === 'middle' || overContainer === 'back') {
                 // Dropping onto the row itself
                newRows[overContainer].push(cardToMove);
            } else {
                return prevRows; // Invalid drop target
            }

            // 验证牌墩数量限制
            const limits = { front: 3, middle: 5, back: 5 };
            if (newRows.front.length > limits.front || newRows.middle.length > limits.middle || newRows.back.length > limits.back) {
                 alert(`牌墩数量超过限制。头道最多 ${limits.front} 张，中道最多 ${limits.middle} 张，后道最多 ${limits.back} 张。`);
                return prevRows; // 如果移动导致超过上限，则撤销移动
            }
            
            updatePlayerRows(newRows);
            setValidationResult(validateArrangement(newRows)); // Re-validate after move
            return newRows;
        });
    };

    const handleCardClick = (cardId) => {
         // Find the container of the clicked card
        const containerId = findContainer(cardId);
        if (!containerId) return; // Should not happen

        setSelectedCardIds(prev => {
            if (prev.includes(cardId)) {
                // If already selected, unselect it
                return prev.filter(id => id !== cardId);
            } else {
                // If not selected, add it
                return [...prev, cardId];
            }
        });
    };
    
    const handleStartComparison = () => {
        const result = validateArrangement(rows);
        setValidationResult(result);
        if(result.isValid) {
            setPlayerReady();
            navigate('/comparison');
        } else {
            alert(result.message || "牌型不合法");
        }
    };

    if (!isGameActive || !player) {
        return (
             <Container className="page-container">
                <Button variant="contained" size="large" onClick={handleDealCards} disabled={isLoading}>
                    {isLoading ? "正在发牌..." : "开始四人牌局"}
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
                        <Button variant="contained" sx={{ bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}>< 退出房间</Button>
                        <Typography variant="h6">
                            <span role="img" aria-label="coin">🪙</span> 积分: 100
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
                        <Button variant="contained" sx={{ bgcolor: '#f57c00' }} onClick={handleStartComparison} disabled={!validationResult?.isValid}>开始比牌</Button>
                    </Stack>
                     {!validationResult?.isValid && validationResult?.message && (
                        <Typography color="error" align="center" sx={{ mt: 1 }}>
                            {validationResult.message}
                        </Typography>
                    )}
                </Box>
            </Box>
        </DndContext>
    );
}

export default ThirteenGamePage;