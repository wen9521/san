import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Stack, CircularProgress, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EightPlayerStatus from '../components/EightPlayerStatus';
import { EightGameRow } from '../components/EightGameRow';
import EightHandDisplay from '../components/EightHandDisplay';
import EightSpecialHandDialog from '../components/EightSpecialHandDialog';
import { useEightGame } from '../context/EightGameContext';
import { sortEightGameCardsByRank, checkForEightGameSpecialHand, evaluateEightGameHand, getHandTypeName } from '../utils/eightLogic';

function EightGamePage() {
    const {
        players, isGameActive, startGame, setPlayerArrangement,
        autoArrangePlayerHand, startComparison, comparisonResult,
        specialHand, setSpecialHand
    } = useEightGame();
    
    const navigate = useNavigate();
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const [handTypes, setHandTypes] = useState({ front: '', middle: '', back: '' });
    const myId = 'player';
    const player = players.find(p => p.id === myId);

    useEffect(() => {
        if (!isGameActive) startGame();
    }, [isGameActive, startGame]);
    
    useEffect(() => {
        if (player?.hand?.length === 8) {
            const detected = checkForEightGameSpecialHand(player.hand);
            setSpecialHand(detected ? { name: detected.name } : null);
        }
    }, [player?.hand, setSpecialHand]);

    useEffect(() => {
        if (player && player.rows) {
            setHandTypes({
                front: getHandTypeName(evaluateEightGameHand(player.rows.front)),
                middle: getHandTypeName(evaluateEightGameHand(player.rows.middle)),
                back: getHandTypeName(evaluateEightGameHand(player.rows.back)),
            });
        }
    }, [player, player?.rows]);

    const handleCardClick = useCallback((cardId) => {
        setSelectedCardIds(prev => prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]);
    }, []);

    const handleRowClick = useCallback((targetRowId) => {
        if (selectedCardIds.length === 0 || !player) return;
        
        let newRows = JSON.parse(JSON.stringify(player.rows));
        const allCardsInRows = [...newRows.front, ...newRows.middle, ...newRows.back];
        
        const movedCards = allCardsInRows.filter(c => selectedCardIds.includes(c.id));
        
        for (let row in newRows) {
            newRows[row] = newRows[row].filter(c => !selectedCardIds.includes(c.id));
        }

        newRows[targetRowId].push(...movedCards);
        newRows[targetRowId] = sortEightGameCardsByRank(newRows[targetRowId]);
        
        setPlayerArrangement(myId, newRows);
        setSelectedCardIds([]);
    }, [selectedCardIds, player, setPlayerArrangement, myId]);

    const handleAutoArrange = () => {
        if (!player) return;
        autoArrangePlayerHand();
        setSelectedCardIds([]);
    };

    const handleStartComparison = () => {
        const result = startComparison();
        if (!result.success) alert(result.message || "所有玩家未准备好");
    };
    
    if (!player) {
        return <Box className="page-container-new-ui" sx={{justifyContent: 'center', alignItems: 'center'}}><CircularProgress /><Typography sx={{color: 'white', mt: 2}}>正在创建八张牌局...</Typography></Box>;
    }
    
    if (comparisonResult) {
        const cardWidth = 50;
        const cardHeight = 70;
        return (
            <Box className="page-container-new-ui" sx={{justifyContent: 'center', alignItems: 'center', color: 'white', p: 1, overflowY: 'auto' }}>
                <Typography variant="h5" align="center" sx={{ mt: 1, mb: 1 }}>比牌结果</Typography>
                <Grid container spacing={1} justifyContent="center">
                    {comparisonResult.players.map(p => {
                        const scoreObj = comparisonResult.scores.find(s => s.playerId === p.id) || {};
                        return (
                            <Grid item xs={4} sm={4} md={4} key={p.id}>
                                <Box sx={{ p: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 2, border: scoreObj.totalScore > 0 ? '1px solid #4caf50' : (scoreObj.totalScore < 0 ? '1px solid #f44336' : '1px solid rgba(255,255,255,0.15)'), height: '100%'}}>
                                    <Typography variant="caption" align="center" component="div" sx={{ fontWeight: 'bold' }}>{p.name}</Typography>
                                    <Typography align="center" sx={{ color: scoreObj.totalScore > 0 ? '#66bb6a' : (scoreObj.totalScore < 0 ? '#ef5350' : 'white'), fontWeight: 'bold', fontSize: '0.8rem' }}>
                                        {scoreObj.totalScore > 0 ? `+${scoreObj.totalScore}` : scoreObj.totalScore}
                                    </Typography>
                                    <EightHandDisplay hand={p.rows.front || []} cardWidth={cardWidth} cardHeight={cardHeight} />
                                    <EightHandDisplay hand={p.rows.middle || []} cardWidth={cardWidth} cardHeight={cardHeight} />
                                    <EightHandDisplay hand={p.rows.back || []} cardWidth={cardWidth} cardHeight={cardHeight} />
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button variant="contained" size="medium" onClick={startGame}>再来一局</Button>
                    <Button variant="outlined" size="medium" onClick={() => navigate('/')} sx={{ ml: 2 }}>返回大厅</Button>
                </Box>
            </Box>
        );
    }
    
    const { rows } = player;
    return (
        <Box className="page-container-new-ui">
            <Box className="game-board glass-effect">
                <EightPlayerStatus players={players} myId={myId} />
                <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                    <EightGameRow id="front" label="头道 (2)" cards={rows.front} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} typeName={handTypes.front} />
                    <EightGameRow id="middle" label="中道 (3)" cards={rows.middle} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} typeName={handTypes.middle} />
                    <EightGameRow id="back" label="尾道 (3)" cards={rows.back} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} typeName={handTypes.back} />
                </Stack>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ p: 1, flexWrap: 'wrap' }}>
                    <Button variant="contained" color="secondary" onClick={handleAutoArrange} sx={{ mb: 1 }}>智能分牌</Button>
                    <Button variant="contained" color="success" onClick={handleStartComparison} sx={{ mb: 1 }}>开始比牌</Button>
                    <Button variant="outlined" color="warning" onClick={() => navigate('/')} sx={{ mb: 1 }}>返回大厅</Button>
                </Stack>
                <EightSpecialHandDialog open={!!specialHand} specialHandName={specialHand?.name} onClose={() => setSpecialHand(null)} onConfirm={() => setSpecialHand(null)} />
            </Box>
        </Box>
    );
}

export default EightGamePage;