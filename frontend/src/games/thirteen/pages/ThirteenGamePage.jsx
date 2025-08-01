import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress, Stack } from '@mui/material';
import { useGame } from '../context/GameContext';
import { Link } from 'react-router-dom';
import PlayerStatus from '../components/PlayerStatus';
import { GameRow } from '../components/GameRow';
import HandDisplay from '../components/HandDisplay';

function ThirteenGamePage() {
    const { players, startGame, setPlayerArrangement } = useGame();
    const player = players.find(p => p.id === 'player');
    const myId = 'player';
    const [selectedCardIds, setSelectedCardIds] = useState([]);

    if (!player) {
        return <Box><CircularProgress /><Typography>正在创建十三张牌局...</Typography></Box>;
    }

    // 牌点击和分区分配
    const handleCardClick = (cardId) => {
        setSelectedCardIds(prev =>
            prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
        );
    };

    const handleRowClick = (targetRowId) => {
        if (selectedCardIds.length === 0 || !player) return;
        const { rows, hand } = player;
        let newRows = JSON.parse(JSON.stringify(rows));
        let allPlayerCards = [
            ...hand,
            ...newRows.front,
            ...newRows.middle,
            ...newRows.back
        ];
        let movedCards = [];
        selectedCardIds.forEach(cardId => {
            let foundCard = allPlayerCards.find(c => c.id === cardId);
            if (foundCard) movedCards.push(foundCard);
        });
        // 移除所有分区已存在的牌
        movedCards.forEach(cardToMove => {
            for (let row in newRows) {
                newRows[row] = newRows[row].filter(c => c.id !== cardToMove.id);
            }
        });
        // 放入目标分区
        newRows[targetRowId] = [...newRows[targetRowId], ...movedCards];
        setPlayerArrangement(myId, newRows);
        setSelectedCardIds([]);
    };

    const { rows, hand } = player;
    return (
        <Box className="page-container-new-ui">
            <Box className="game-board glass-effect">
                <PlayerStatus players={players} myId={myId} />
                <HandDisplay
                    hand={hand.filter(card =>
                        !rows.front.includes(card) &&
                        !rows.middle.includes(card) &&
                        !rows.back.includes(card)
                    )}
                    onCardClick={handleCardClick}
                    selectedCardIds={selectedCardIds}
                />
                <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                    <GameRow
                        id="front"
                        label="头道 (3)"
                        cards={rows.front}
                        onCardClick={handleCardClick}
                        onRowClick={handleRowClick}
                        selectedCardIds={selectedCardIds}
                    />
                    <GameRow
                        id="middle"
                        label="中道 (5)"
                        cards={rows.middle}
                        onCardClick={handleCardClick}
                        onRowClick={handleRowClick}
                        selectedCardIds={selectedCardIds}
                    />
                    <GameRow
                        id="back"
                        label="尾道 (5)"
                        cards={rows.back}
                        onCardClick={handleCardClick}
                        onRowClick={handleRowClick}
                        selectedCardIds={selectedCardIds}
                    />
                </Stack>
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ p: 2 }}>
                    <Button variant="contained" color="primary" component={Link} to="/thirteen/comparison">
                        开始比牌
                    </Button>
                    <Button variant="contained" color="success" onClick={startGame}>
                        重新开始
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default ThirteenGamePage;