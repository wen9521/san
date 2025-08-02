import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography, Stack, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEightGame } from '../context/EightGameContext';
import EightPlayerStatus from '../components/EightPlayerStatus';
import { EightGameRow } from '../components/EightGameRow';
import EightHandDisplay from '../components/EightHandDisplay'; // 确保导入
import EightSpecialHandBanner from '../components/EightSpecialHandBanner';
import EightComparisonDisplay from '../components/EightComparisonDisplay';

function EightGamePage() {
    const {
        players,
        startGame,
        setPlayerArrangement,
        autoArrangePlayerHand,
        startComparison,
        comparisonResult,
        specialHand,
        confirmSpecialHand
    } = useEightGame();
    
    const navigate = useNavigate();
    const player = players.find(p => p.id === 'player');
    const myId = 'player';
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [showSpecialHandBanner, setShowSpecialHandBanner] = useState(false);

    useEffect(() => {
        if (specialHand) {
            setShowSpecialHandBanner(true);
        }
    }, [specialHand]);

    if (!player) {
        return <Box className="page-container-new-ui" sx={{ justifyContent: 'center', alignItems: 'center' }}><CircularProgress /><Typography sx={{ color: 'white', mt: 2 }}>正在创建八张牌局...</Typography></Box>;
    }
    
    if (comparisonResult) {
        return <EightComparisonDisplay result={comparisonResult} onRestart={() => startGame(players.length)} />;
    }

    const handleCardClick = (cardId) => {
        setSelectedCardIds(prev =>
            prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
        );
    };

    const handleRowClick = (targetRowId) => {
        if (selectedCardIds.length === 0 || !player) return;

        const newRows = JSON.parse(JSON.stringify(player.rows));
        
        // 【重要修正】: 同时从手牌(hand)和牌道(rows)中查找要移动的牌
        const allPlayerCards = [...player.hand, ...newRows.front, ...newRows.middle, ...newRows.back];
        const cardsToMove = allPlayerCards.filter(c => selectedCardIds.includes(c.id));

        if (cardsToMove.length === 0) return;

        // 【重要修正】: 当牌从手牌移入牌道时，也需要更新手牌
        const newHand = player.hand.filter(c => !selectedCardIds.includes(c.id));
        newRows.front = newRows.front.filter(c => !selectedCardIds.includes(c.id));
        newRows.middle = newRows.middle.filter(c => !selectedCardIds.includes(c.id));
        newRows.back = newRows.back.filter(c => !selectedCardIds.includes(c.id));

        newRows[targetRowId].push(...cardsToMove);
        
        // 【重要修正】: 同时更新手牌和牌道
        const playerWithUpdatedHand = { ...player, hand: newHand };
        setPlayers(players.map(p => p.id === myId ? playerWithUpdatedHand : p));
        setPlayerArrangement(myId, newRows);
        
        setSelectedCardIds([]);
    };
    
    const handleConfirmSpecial = () => { confirmSpecialHand(); setShowSpecialHandBanner(false); };
    const handleCancelSpecial = () => { setShowSpecialHandBanner(false); };
    
    const createRowClickHandler = (rowId) => () => handleRowClick(rowId);

    // 【重要修正】: 同时解构 hand 和 rows
    const { rows, hand } = player;

    return (
        <Box className="page-container-new-ui" sx={{ position: 'relative' }}>
             {showSpecialHandBanner && specialHand && (
                <EightSpecialHandBanner
                    specialHand={specialHand.handInfo}
                    onConfirm={handleConfirmSpecial}
                    onCancel={handleCancelSpecial}
                />
            )}
            <Box className="game-board glass-effect">
                <EightPlayerStatus players={players} myId={myId} />
                <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center', p: 1 }}>
                    <EightGameRow id="front" label="头道(2张)" cards={rows.front} onCardClick={handleCardClick} onRowClick={createRowClickHandler('front')} selectedCardIds={selectedCardIds} />
                    <EightGameRow id="middle" label="中道(3张)" cards={rows.middle} onCardClick={handleCardClick} onRowClick={createRowClickHandler('middle')} selectedCardIds={selectedCardIds} />
                    <EightGameRow id="back" label="尾道(3张)" cards={rows.back} onCardClick={handleCardClick} onRowClick={createRowClickHandler('back')} selectedCardIds={selectedCardIds} />
                </Stack>
                
                {/* 【重要修正】: 添加手牌显示区域 */}
                <Paper elevation={3} sx={{ p: 1, m: 1, bgcolor: 'rgba(0,0,0,0.2)' }}>
                    <Typography variant="subtitle1" sx={{ color: 'white', textAlign: 'center', mb: 1 }}>你的手牌</Typography>
                    <EightHandDisplay 
                        hand={hand} 
                        onCardClick={handleCardClick} 
                        selectedCardIds={selectedCardIds}
                    />
                </Paper>

                <Stack direction="row" spacing={1} justifyContent="center" sx={{ p: 1, flexWrap: 'wrap' }}>
                    <Button variant="contained" color="secondary" onClick={autoArrangePlayerHand}>智能分牌</Button>
                    <Button variant="contained" color="primary" onClick={startComparison}>开始比牌</Button>
                    <Button variant="contained" color="success" onClick={() => startGame(players.length)}>重新开始</Button>
                    <Button variant="outlined" color="warning" onClick={() => navigate('/')}>返回大厅</Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default EightGamePage;
