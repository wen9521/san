import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Stack } from '@mui/material';
import { useGame } from '../context/GameContext';
import { Link, useNavigate } from 'react-router-dom';
import ThirteenPlayerStatus from '../components/ThirteenPlayerStatus';
import { ThirteenGameRow } from '../components/ThirteenGameRow';
import { getAreaType } from '../utils/thirteenLogic';
import PointsDialog from '../components/PointsDialog';

function ThirteenGamePage() {
    const { players, startGame, setPlayerArrangement, autoArrangePlayerHand } = useGame();
    const navigate = useNavigate();
    const player = players.find(p => p.id === 'player');
    const myId = 'player';
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [handTypes, setHandTypes] = useState({ front: '', middle: '', back: '' });

    useEffect(() => {
        if (player && player.rows) {
            // 【重要修正】: 确保传递给 getAreaType 的是 card ID 数组
            const getIds = (cards) => (Array.isArray(cards) ? cards.map(c => c.id) : []);
            setHandTypes({
                front: getAreaType(getIds(player.rows.front), 'head'),
                middle: getAreaType(getIds(player.rows.middle), 'middle'),
                back: getAreaType(getIds(player.rows.back), 'tail'),
            });
        }
    }, [player, player?.rows]); // 依赖项更新

    if (!player) {
        return <Box className="page-container-new-ui" sx={{justifyContent: 'center', alignItems: 'center'}}><CircularProgress /><Typography sx={{color: 'white', mt: 2}}>正在加载...</Typography></Box>;
    }

    const handleCardClick = (cardId) => {
        setSelectedCardIds(prev =>
            prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
        );
    };

    const handleRowClick = (targetRowId) => {
        if (selectedCardIds.length === 0 || !player) return;
        
        let newRows = JSON.parse(JSON.stringify(player.rows));
        // 所有牌都在rows里，直接从rows里找
        const allCardsInRows = [...newRows.front, ...newRows.middle, ...newRows.back];
        
        const movedCards = allCardsInRows.filter(c => selectedCardIds.includes(c.id));
        if (movedCards.length === 0) return;
        
        // 从所有道中移除这些牌
        newRows.front = newRows.front.filter(c => !selectedCardIds.includes(c.id));
        newRows.middle = newRows.middle.filter(c => !selectedCardIds.includes(c.id));
        newRows.back = newRows.back.filter(c => !selectedCardIds.includes(c.id));

        // 添加到目标道
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
                        onRowClick={() => handleRowClick('front')} // 传递正确的道ID
                        selectedCardIds={selectedCardIds}
                        typeName={handTypes.front}
                    />
                    <ThirteenGameRow
                        id="middle"
                        label="中道"
                        cards={rows.middle}
                        onCardClick={handleCardClick}
                        onRowClick={() => handleRowClick('middle')}
                        selectedCardIds={selectedCardIds}
                        typeName={handTypes.middle}
                    />
                    <ThirteenGameRow
                        id="back"
                        label="尾道"
                        cards={rows.back}
                        onCardClick={handleCardClick}
                        onRowClick={() => handleRowClick('back')}
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
                    <Button variant="contained" color="success" onClick={() => startGame(players.length)} sx={{ mb: 1 }}>
                        重新开始
                    </Button>
                    <Button variant="outlined" color="warning" onClick={() => navigate('/')} sx={{ mb: 1 }}>
                        返回大厅
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default ThirteenGamePage;
