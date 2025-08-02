import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEightGame } from '../context/EightGameContext';
import EightPlayerStatus from '../components/EightPlayerStatus';
import { EightGameRow } from '../components/EightGameRow';
import EightSpecialHandBanner from '../components/EightSpecialHandBanner'; // Import the new banner
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

        let newRows = JSON.parse(JSON.stringify(player.rows));
        const cardsToMove = [];
        
        // Find all selected cards from any row or the hand
        Object.values(newRows).flat().concat(player.hand).forEach(c => {
             if(selectedCardIds.includes(c.id) && !cardsToMove.find(mc => mc.id === c.id)) {
                 cardsToMove.push(c);
             }
        });

        // Remove selected cards from their original places
        Object.keys(newRows).forEach(rowKey => {
            newRows[rowKey] = newRows[rowKey].filter(c => !selectedCardIds.includes(c.id));
        });

        // Add to the target row
        newRows[targetRowId].push(...cardsToMove);
        
        setPlayerArrangement(myId, newRows);
        setSelectedCardIds([]);
    };

    const handleConfirmSpecial = () => {
        confirmSpecialHand();
        setShowSpecialHandBanner(false);
    };

    const handleCancelSpecial = () => {
        setShowSpecialHandBanner(false);
    };

    const { rows } = player;

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
                <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                    <EightGameRow id="front" label="头道(2张)" cards={rows.front} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} />
                    <EightGameRow id="middle" label="中道(3张)" cards={rows.middle} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} />
                    <EightGameRow id="back" label="尾道(3张)" cards={rows.back} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} />
                </Stack>
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
