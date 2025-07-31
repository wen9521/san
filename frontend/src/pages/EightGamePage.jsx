import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Stack, CircularProgress } from '@mui/material';
import PlayerStatus from '../components/PlayerStatus';
import { GameRow } from '../components/GameRow';
import HandDisplay from '../components/HandDisplay';
import SpecialHandDialog from '../components/SpecialHandDialog';
import { useEightGame } from '../context/EightGameContext';
import { sortEightGameCardsByRank, checkForEightGameSpecialHand } from '../utils/eightLogic';

function EightGamePage() {
    const {
        players, isGameActive, startGame, setPlayerArrangement,
        autoArrangePlayerHand, startComparison, comparisonResult,
        specialHand, setSpecialHand
    } = useEightGame();
    
    const [selectedCardIds, setSelectedCardIds] = useState([]);
    const myId = 'player';
    const player = players.find(p => p.id === myId);

    // 【核心修复】添加加载守卫，确保player对象存在
    if (!player) {
        return (
            <Box className="page-container">
                <CircularProgress />
                <Typography sx={{ color: 'white', mt: 2 }}>正在创建八张牌局...</Typography>
            </Box>
        );
    }
    
    // 只有当player存在时，才安全地解构rows
    const { rows, hand } = player;

    useEffect(() => {
        if (!isGameActive) startGame();
    }, [isGameActive, startGame]);

    useEffect(() => {
        if (hand?.length === 8) {
            const detected = checkForEightGameSpecialHand(hand);
            setSpecialHand(detected ? { name: detected.name } : null);
        }
    }, [hand, setSpecialHand]);

    const handleCardClick = useCallback((cardId) => {
        setSelectedCardIds(prev => prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]);
    }, []);

    const handleRowClick = useCallback((targetRowId) => {
        if (selectedCardIds.length === 0) return;
        
        let newRows = JSON.parse(JSON.stringify(rows));
        let allPlayerCards = [...hand, ...newRows.front, ...newRows.middle, ...newRows.back];
        let movedCards = [];

        selectedCardIds.forEach(cardId => {
            let foundCard = allPlayerCards.find(c => c.id === cardId);
            if(foundCard) movedCards.push(foundCard);
        });

        // 从所有地方移除
        movedCards.forEach(cardToMove => {
             for (let row in newRows) {
                newRows[row] = newRows[row].filter(c => c.id !== cardToMove.id);
            }
            // 注意：这里我们不应该直接修改 context 提供的 hand
        });

        newRows[targetRowId] = sortEightGameCardsByRank([...newRows[targetRowId], ...movedCards]);
        setPlayerArrangement(myId, newRows);
        setSelectedCardIds([]);
    }, [selectedCardIds, rows, hand, setPlayerArrangement, myId]);

    const handleAutoArrange = () => {
        autoArrangePlayerHand();
        setSelectedCardIds([]);
    };

    const handleStartComparison = () => {
        const result = startComparison();
        if (!result.success) alert(result.message || "所有玩家未准备好");
    };

    const handleRestart = () => startGame();

    if (comparisonResult) {
        return (
            <Box className="page-container" sx={{ color: 'white', p: 2 }}>
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
                                <HandDisplay hand={p.rows.front || []} />
                                <HandDisplay hand={p.rows.middle || []} />
                                <HandDisplay hand={p.rows.back || []} />
                            </Box>
                        );
                    })}
                </Stack>
                <Box sx={{ mt: 4, textAlign: 'center' }}><Button variant="contained" size="large" onClick={handleRestart}>再来一局</Button></Box>
            </Box>
        );
    }
    
    return (
        <Box className="page-container-new-ui">
            <Box className="game-board glass-effect">
                <PlayerStatus players={players} myId={myId} />
                <HandDisplay hand={hand.filter(card => !rows.front.includes(card) && !rows.middle.includes(card) && !rows.back.includes(card))} onCardClick={handleCardClick} selectedCardIds={selectedCardIds} />
                <Stack spacing={2} sx={{ flexGrow: 1, justifyContent: 'center' }}>
                    <GameRow id="front" label="头道 (2)" cards={rows.front} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} />
                    <GameRow id="middle" label="中道 (3)" cards={rows.middle} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} />
                    <GameRow id="back" label="尾道 (3)" cards={rows.back} onCardClick={handleCardClick} onRowClick={handleRowClick} selectedCardIds={selectedCardIds} />
                </Stack>
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ p: 2 }}>
                    <Button variant="contained" color="primary" onClick={handleAutoArrange}>智能分牌</Button>
                    <Button variant="contained" color="success" onClick={handleStartComparison}>开始比牌</Button>
                </Stack>
                <SpecialHandDialog open={!!specialHand} specialHandName={specialHand?.name} onClose={() => setSpecialHand(null)} onConfirm={() => setSpecialHand(null)} />
            </Box>
        </Box>
    );
}

export default EightGamePage;
