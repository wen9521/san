import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Stack } from '@mui/material';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import ThirteenPlayerStatus from '../components/ThirteenPlayerStatus';
import { ThirteenGameRow } from '../components/ThirteenGameRow';
import { getAreaType } from '../utils/thirteenLogic';
import PointsDialog from '../components/PointsDialog';

function ThirteenGamePage() {
    const { players, startGame, setPlayerArrangement, autoArrangePlayerHand, startComparison } = useGame(); // 获取 startComparison
    const navigate = useNavigate();
    const player = players.find(p => p.id === 'player');
    const myId = 'player';
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [handTypes, setHandTypes] = useState({ front: '', middle: '', back: '' });

    useEffect(() => {
        if (player && player.rows) {
            const getIds = (cards) => (Array.isArray(cards) ? cards.map(c => c.id) : []);
            setHandTypes({
                front: getAreaType(getIds(player.rows.front), 'head'),
                middle: getAreaType(getIds(player.rows.middle), 'middle'),
                back: getAreaType(getIds(player.rows.back), 'tail'),
            });
        }
    }, [player, player?.rows]);

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
        const allCardsInRows = [...newRows.front, ...newRows.middle, ...newRows.back];
        
        const movedCards = allCardsInRows.filter(c => selectedCardIds.includes(c.id));
        if (movedCards.length === 0) return;
        
        newRows.front = newRows.front.filter(c => !selectedCardIds.includes(c.id));
        newRows.middle = newRows.middle.filter(c => !selectedCardIds.includes(c.id));
        newRows.back = newRows.back.filter(c => !selectedCardIds.includes(c.id));

        newRows[targetRowId].push(...movedCards);
        
        setPlayerArrangement(myId, newRows);
        setSelectedCardIds([]);
    };

    const handleAutoArrange = () => {
        if (!player) return;
        autoArrangePlayerHand();
        setSelectedCardIds([]);
    };
    
    // 【修复】: 创建一个新的处理函数
    const handleStartComparison = () => {
        startComparison(); // 先调用 context 中的计算函数
        navigate('/thirteen/comparison'); // 再进行页面跳转
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
                        onRowClick={() => handleRowClick('front')}
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
                    {/* 【修复】: 修改按钮，移除 component 和 to 属性，使用 onClick */}
                    <Button variant="contained" color="primary" onClick={handleStartComparison} sx={{ mb: 1 }}>
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
