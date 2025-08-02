import React, { useState } from 'react';
import { Box, Button, CircularProgress, Typography, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // 引入 useNavigate
import { useEightGame } from '../context/EightGameContext';
import EightPlayerStatus from '../components/EightPlayerStatus';
import { EightGameRow } from '../components/EightGameRow';
import EightSpecialHandDialog from '../components/EightSpecialHandDialog';
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
    
    const navigate = useNavigate(); // 初始化 navigate
    const player = players.find(p => p.id === 'player');
    const myId = 'player';
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [isSpecialHandDialogOpen, setIsSpecialHandDialogOpen] = useState(true);

    React.useEffect(() => {
        if (specialHand) {
            setIsSpecialHandDialogOpen(true);
        }
    }, [specialHand]);

    if (!player) {
        return <Box className="page-container-new-ui" sx={{ justifyContent: 'center', alignItems: 'center' }}><CircularProgress /><Typography sx={{ color: 'white', mt: 2 }}>正在创建八张牌局...</Typography></Box>;
    }
    
    if (comparisonResult) {
        return <EightComparisonDisplay result={comparisonResult} onRestart={startGame} />;
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
        
        Object.keys(newRows).forEach(rowKey => {
            newRows[rowKey].forEach(c => {
                 if(selectedCardIds.includes(c.id)) cardsToMove.push(c);
            });
        });
        player.hand.forEach(c => {
             if(selectedCardIds.includes(c.id) && !cardsToMove.find(mc => mc.id === c.id)) cardsToMove.push(c);
        })

        Object.keys(newRows).forEach(rowKey => {
            newRows[rowKey] = newRows[rowKey].filter(c => !selectedCardIds.includes(c.id));
        });

        newRows[targetRowId].push(...cardsToMove);
        
        setPlayerArrangement(myId, newRows);
        setSelectedCardIds([]);
    };

    const handleConfirmSpecial = () => {
        confirmSpecialHand();
        setIsSpecialHandDialogOpen(false);
    };

    const handleCancelSpecial = () => {
        setIsSpecialHandDialogOpen(false);
    };

    const { rows } = player;

    return (
        <Box className="page-container-new-ui">
             {specialHand && (
                <EightSpecialHandDialog
                    open={isSpecialHandDialogOpen}
                    specialHand={specialHand.handInfo}
                    onConfirm={handleConfirmSpecial}
                    onCancel={handleCancelSpecial}
                />
            )}
            {/* 移除外层的 Grid 布局，并让游戏板占据所有空间 */}
            <Box className="game-board glass-effect">
                <EightPlayerStatus players={players} myId={myId} />
                <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                    <EightGameRow id="front" label="头道(2张)" cards={rows.front} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} />
                    <EightGameRow id="middle" label="中道(3张)" cards={rows.middle} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} />
                    <EightGameRow id="back" label="尾道(3张)" cards={rows.back} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} />
                </Stack>
                {/* 重新添加“返回大厅”按钮 */}
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ p: 1, flexWrap: 'wrap' }}>
                    <Button variant="contained" color="secondary" onClick={autoArrangePlayerHand}>智能分牌</Button>
                    <Button variant="contained" color="primary" onClick={startComparison}>开始比牌</Button>
                    <Button variant="contained" color="success" onClick={startGame}>重新开始</Button>
                    <Button variant="outlined" color="warning" onClick={() => navigate('/')}>返回大厅</Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default EightGamePage;