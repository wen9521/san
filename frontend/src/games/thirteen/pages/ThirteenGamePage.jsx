import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Stack } from '@mui/material';
import { useGame } from '../context/GameContext';
import { Link, useNavigate } from 'react-router-dom';
import ThirteenPlayerStatus from '../components/ThirteenPlayerStatus';
import { ThirteenGameRow } from '../components/ThirteenGameRow';
import { ThirteenHandDisplay } from '../components/ThirteenHandDisplay';
import { getHandType } from '../utils/thirteenLogic';
import PointsDialog from '../components/PointsDialog';

function ThirteenGamePage() {
    const { players, startGame, setPlayerArrangement, autoArrangePlayerHand } = useGame();
    const navigate = useNavigate();
    const player = players.find(p => p.id === 'player');
    const myId = 'player';
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [handTypes, setHandTypes] = useState({ front: '', middle: '', back: '' });
    const [pointsDialogOpen, setPointsDialogOpen] = useState(false);

    useEffect(() => {
        if (player && player.rows) {
            setHandTypes({
                front: getHandType(player.rows.front)?.type,
                middle: getHandType(player.rows.middle)?.type,
                back: getHandType(player.rows.back)?.type,
            });
        }
    }, [player]);

    if (!player) {
        return <Box className="page-container-new-ui" sx={{justifyContent: 'center', alignItems: 'center'}}><CircularProgress /><Typography sx={{color: 'white', mt: 2}}>正在创建十三张牌局...</Typography></Box>;
    }

    const handleCardClick = (cardId) => {
        setSelectedCardIds(prev =>
            prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
        );
    };

    const handleRowClick = (targetRowId) => {
        if (selectedCardIds.length === 0 || !player) return;
        
        let newRows = JSON.parse(JSON.stringify(player.rows));
        const allCardsInRows = [...newRows.front, ...newRows.middle, ...newRows.back];
        
        const movedCards = allCardsInRows.filter(c => selectedCardIds.includes(c.id));
        
        // Remove moved cards from their original rows
        for (let row in newRows) {
            newRows[row] = newRows[row].filter(c => !selectedCardIds.includes(c.id));
        }

        // Add moved cards to the target row
        newRows[targetRowId].push(...movedCards);
        
        setPlayerArrangement(myId, newRows);
        setSelectedCardIds([]);
    };

    const handleAutoArrange = () => {
        if (!player) return;
        autoArrangePlayerHand();
        setSelectedCardIds([]);
    };

    const { rows } = player;
    return (
        <Box className="page-container-new-ui">
            <Box className="game-board glass-effect">
                <ThirteenPlayerStatus players={players} myId={myId} />
                <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                    <ThirteenGameRow
                        id="front"
                        label="头道"
                        cards={rows.front}
                        onCardClick={handleCardClick}
                        onRowClick={handleRowClick}
                        selectedCardIds={selectedCardIds}
                        typeName={handTypes.front}
                    />
                    <ThirteenGameRow
                        id="middle"
                        label="中道"
                        cards={rows.middle}
                        onCardClick={handleCardClick}
                        onRowClick={handleRowClick}
                        selectedCardIds={selectedCardIds}
                        typeName={handTypes.middle}
                    />
                    <ThirteenGameRow
                        id="back"
                        label="尾道"
                        cards={rows.back}
                        onCardClick={handleCardClick}
                        onRowClick={handleRowClick}
                        selectedCardIds={selectedCardIds}
                        typeName={handTypes.back}
                    />
                </Stack>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ p: 1, flexWrap: 'wrap' }}>
                    <Button variant="contained" color="secondary" onClick={handleAutoArrange} sx={{ mb: 1 }}>
                        智能分牌
                    </Button>
                    <Button variant="contained" color="primary" component={Link} to="/thirteen/comparison" sx={{ mb: 1 }}>
                        开始比牌
                    </Button>
                    <Button variant="contained" color="success" onClick={startGame} sx={{ mb: 1 }}>
                        重新开始
                    </Button>
                    <Button variant="outlined" color="warning" onClick={() => navigate('/')} sx={{ mb: 1 }}>
                        返回大厅
                    </Button>
                    <Button variant="contained" color="secondary" onClick={() => setPointsDialogOpen(true)}>
                        分数详情
                     </Button>
                </Stack>
            </Box>
            <PointsDialog open={pointsDialogOpen} onClose={() => setPointsDialogOpen(false)} />
        </Box>
    );
}

export default ThirteenGamePage;