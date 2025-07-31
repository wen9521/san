import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/material';
import PlayerStatus from '../components/PlayerStatus';
import { GameRow } from '../components/GameRow';
import HandDisplay from '../components/HandDisplay';
import SpecialHandDialog from '../components/SpecialHandDialog';
import { useEightGame } from '../context/EightGameContext';
import { sortEightGameCardsByRank, validateEightGameArrangement, checkForEightGameSpecialHand } from '../utils/eightLogic';

function EightGamePage() {
    const {
        players, currentPlayer, isGameActive, startGame, setPlayerArrangement,
        autoArrangePlayerHand, startComparison, comparisonResult,
        dutouCurrent, dutouHistory, chooseDutouScore, challengeDutou, openDutouDialog,
        specialHand, setSpecialHand
    } = useEightGame();
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const myId = 'player';
    const player = players.find(p => p.id === myId);
    const rows = player?.rows || { front: [], middle: [], back: [] };

    useEffect(() => {
        if (!isGameActive) startGame();
    }, [isGameActive, startGame]);

    useEffect(() => {
        if (player?.hand && player.hand.length === 8) {
            const detected = checkForEightGameSpecialHand(player.hand);
            setSpecialHand(detected ? { name: detected.name } : null);
        }
    }, [player, setSpecialHand]);

    const handleCardClick = useCallback((cardId) => {
        setSelectedCardIds(prev => {
            if (prev.includes(cardId)) return prev.filter(id => id !== cardId);
            return [...prev, cardId];
        });
    }, []);

    const handleRowClick = useCallback((targetRowId) => {
        if (selectedCardIds.length === 0) return;
        let newRows = JSON.parse(JSON.stringify(rows));
        let movedCards = [];
        selectedCardIds.forEach(cardId => {
            let foundCard = null;
            for (const rowId in newRows) {
                const index = newRows[rowId].findIndex(c => c.id === cardId);
                if (index !== -1) {
                    foundCard = newRows[rowId][index];
                    newRows[rowId].splice(index, 1);
                    break;
                }
            }
            if (foundCard) movedCards.push(foundCard);
        });
        newRows[targetRowId] = sortEightGameCardsByRank([...newRows[targetRowId], ...movedCards]);
        setPlayerArrangement(myId, newRows);
        setSelectedCardIds([]);
    }, [selectedCardIds, rows, setPlayerArrangement]);

    const handleAutoArrange = () => {
        autoArrangePlayerHand();
        setSelectedCardIds([]);
    };

    const handleStartComparison = () => {
        const result = startComparison();
        if (!result.success) alert(result.message || "所有玩家未准备好");
    };

    const handleDutouScoreClick = (dutouPlayerId, score) => {
        if (dutouPlayerId === myId) return;
        const challenger = players.find(p => p.id === myId);
        if (challenger) challengeDutou(dutouPlayerId, myId, challenger.name);
    };

    const handleRestart = () => startGame();

    // 比牌结果界面（6人）
    if (comparisonResult) {
        return (
            <Box className="page-container" sx={{ color: 'white', p: 2 }}>
                <Typography variant="h4" align="center" sx={{ mt: 2, mb: 2 }}>比牌结果</Typography>
                <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                    {comparisonResult.players.map((p, idx) => {
                        const scoreObj = comparisonResult.scores.find(s => s.playerId === p.id) || {};
                        return (
                            <Box key={p.id} sx={{
                                p: 2, minWidth: 220, background: 'rgba(255,255,255,0.08)', borderRadius: 2,
                                border: scoreObj.totalScore > 0 ? '2px solid #4caf50' : (scoreObj.totalScore < 0 ? '2px solid #f44336' : '2px solid rgba(255,255,255,0.15)'),
                                mb: 1
                            }}>
                                <Typography variant="subtitle1" align="center">{p.name}</Typography>
                                <Typography align="center" sx={{ color: scoreObj.totalScore > 0 ? '#66bb6a' : (scoreObj.totalScore < 0 ? '#ef5350' : 'white'), fontWeight: 'bold' }}>
                                    {scoreObj.totalScore > 0 ? `+${scoreObj.totalScore}` : scoreObj.totalScore}
                                </Typography>
                                <Typography align="center" variant="caption" sx={{ mt: 1 }}>头道</Typography>
                                <HandDisplay hand={p.rows.front || []} />
                                <Typography align="center" variant="caption" sx={{ mt: 1 }}>中道</Typography>
                                <HandDisplay hand={p.rows.middle || []} />
                                <Typography align="center" variant="caption" sx={{ mt: 1 }}>尾道</Typography>
                                <HandDisplay hand={p.rows.back || []} />
                            </Box>
                        );
                    })}
                </Stack>
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button variant="contained" size="large" onClick={handleRestart}>再来一局</Button>
                </Box>
            </Box>
        );
    }

    if (!isGameActive || !player) {
        return (
            <Box className="page-container">
                <CircularProgress />
                <Typography sx={{ color: 'white', mt: 2 }}>正在创建八张牌局...</Typography>
            </Box>
        );
    }

    return (
        <Box className="page-container-new-ui">
            <Box className="game-board glass-effect">
                <PlayerStatus
                    players={players}
                    myId={myId}
                    dutouCurrent={dutouCurrent}
                    dutouHistory={dutouHistory}
                    onDutouClick={openDutouDialog}
                    onDutouScoreClick={handleDutouScoreClick}
                />
                <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                    <GameRow id="front" label="头道 (2)" cards={rows.front} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} onRowClick={handleRowClick} />
                    <GameRow id="middle" label="中道 (3)" cards={rows.middle} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} onRowClick={handleRowClick} />
                    <GameRow id="back" label="尾道 (3)" cards={rows.back} selectedCardIds={selectedCardIds} onCardClick={handleCardClick} onRowClick={handleRowClick} />
                </Stack>
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ p: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleAutoArrange}>智能分牌</Button>
                    <Button variant="contained" color="success" onClick={handleStartComparison}>开始比牌</Button>
                </Stack>
                <SpecialHandDialog
                    open={!!specialHand}
                    specialHandName={specialHand?.name}
                    onClose={() => setSpecialHand(null)}
                    onConfirm={() => setSpecialHand(null)}
                />
            </Box>
        </Box>
    );
}

export default EightGamePage;
