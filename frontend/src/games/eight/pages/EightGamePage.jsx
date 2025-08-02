import React, { useState } from 'react';
import { Box, Button, CircularProgress, Typography, Stack, Grid } from '@mui/material';
import { useEightGame } from '../context/EightGameContext';
import EightPlayerStatus from '../components/EightPlayerStatus';
import { EightGameRow } from '../components/EightGameRow';
import EightSpecialHandDialog from '../components/EightSpecialHandDialog';
import EightCompactHandDisplay from '../components/EightCompactHandDisplay';
import EightComparisonDisplay from '../components/EightComparisonDisplay'; // 引入新的比牌组件

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
    
    const player = players.find(p => p.id === 'player');
    const myId = 'player';
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [isSpecialHandDialogOpen, setIsSpecialHandDialogOpen] = useState(true);

    // 当 context 中的 specialHand 变化时，重置对话框的打开状态
    React.useEffect(() => {
        if (specialHand) {
            setIsSpecialHandDialogOpen(true);
        }
    }, [specialHand]);

    if (!player) {
        return <Box className="page-container-new-ui" sx={{ justifyContent: 'center', alignItems: 'center' }}><CircularProgress /><Typography sx={{ color: 'white', mt: 2 }}>正在创建八张牌局...</Typography></Box>;
    }
    
    // 使用新的比牌组件
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
        
        // 从所有墩和手牌中找到选中的牌
        Object.keys(newRows).forEach(rowKey => {
            newRows[rowKey].forEach(c => {
                 if(selectedCardIds.includes(c.id)) cardsToMove.push(c);
            });
        });
        player.hand.forEach(c => {
             if(selectedCardIds.includes(c.id) && !cardsToMove.find(mc => mc.id === c.id)) cardsToMove.push(c);
        })


        // 从所有墩中移除
        Object.keys(newRows).forEach(rowKey => {
            newRows[rowKey] = newRows[rowKey].filter(c => !selectedCardIds.includes(c.id));
        });

        // 添加到目标墩
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
            <Grid container spacing={1} sx={{ height: '100%'}}>
                <Grid item xs={12} md={9} sx={{ display: 'flex', flexDirection: 'column'}}>
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
                            <Button variant="contained" color="success" onClick={startGame}>重新开始</Button>
                        </Stack>
                    </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Box className="glass-effect" sx={{ p: 1, height: '100%' }}>
                        <Typography variant="h6" align="center" sx={{ color: 'white' }}>其他玩家</Typography>
                        <Stack spacing={1} sx={{ mt: 1 }}>
                            {players.filter(p => p.id !== myId).map(p => (
                                <EightCompactHandDisplay key={p.id} player={p} />
                            ))}
                        </Stack>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}

export default EightGamePage;