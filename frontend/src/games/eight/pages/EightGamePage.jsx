import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PlayerStatus from '../components/PlayerStatus';
import { GameRow } from '../components/GameRow';
import SpecialHandDialog from '../components/SpecialHandDialog';
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
        return (
            <Box className="page-container-new-ui" sx={{justifyContent: 'center', alignItems: 'center', color: 'white', p: 2 }}>
                <Typography variant="h4" align="center" sx={{ mt: 2, mb: 2 }}>比牌结果</Typography>
                <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                    {comparisonResult.players.map(p => {
                        const scoreObj = comparisonResult.scores.find(s => s.playerId === p.id) || {};
                        return (
                            <Box key={p.id} sx={{ p: 2, minWidth: 220, background: 'rgba(255,255,255,0.08)', borderRadius: 2, border: scoreObj.totalScore > 0 ? '2px solid #4caf50' : (scoreObj.totalScore < 0 ? '2px solid #f44336' : '2px solid rgba(255,255,255,0.15)')}}>
                                <Typography variant="subtitle1" align="center">{p.name}</Typography>
                                <Typography align="center" sx={{ color: scoreObj.totalScore > 0 ? '#66bb6a' : (scoreObj.totalScore < 0 ? '#ef5350' : 'white'), fontWeight: 'bold' }}>
                                    {scoreObj.totalScore > 0 ? `+${scoreObj.totalScore}` : scoreObj.totalScore}
                                </Typography>
                                {/* Here we assume rows are populated for comparison */}
                            </Box>
                        );
                    })}
                </Stack>
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button variant="contained" size="large" onClick={startGame}>再来一局</Button>
                    <Button variant="outlined" size="large" onClick={() => navigate('/')} sx={{ ml: 2 }}>返回大厅</Button>
                </Box>
            </Box>
        );
    }
    
    const { rows } = player;
    return (
        <Box className="page-container-new-ui">
            <Box className="game-board glass-effect">
                <PlayerStatus players={players} myId={myId} />
                <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                    <GameRow id="front" label="头道 (2)" cards={rows.front} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} typeName={handTypes.front} />
                    <GameRow id="middle" label="中道 (3)" cards={rows.middle} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} typeName={handTypes.middle} />
                    <GameRow id="back" label="尾道 (3)" cards={rows.back} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} typeName={handTypes.back} />
                </Stack>
                <Stack direction="row" spacing={1} justifyContent="center" sx={{ p: 1, flexWrap: 'wrap' }}>
                    <Button variant="contained" color="secondary" onClick={handleAutoArrange} sx={{ mb: 1 }}>智能分牌</Button>
                    <Button variant="contained" color="success" onClick={handleStartComparison} sx={{ mb: 1 }}>开始比牌</Button>
                    <Button variant="outlined" color="warning" onClick={() => navigate('/')} sx={{ mb: 1 }}>返回大厅</Button>
                </Stack>
                <SpecialHandDialog open={!!specialHand} specialHandName={specialHand?.name} onClose={() => setSpecialHand(null)} onConfirm={() => setSpecialHand(null)} />
            </Box>
        </Box>
    );
}

export default EightGamePage;
