import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import HandDisplay from '../components/HandDisplay';
import { useEightGame } from '../context/EightGameContext';
// 【已修改】导入重命名后的函数
import { 
    validateEightGameArrangement, 
    checkForEightGameSpecialHand, 
    calculateEightGameTotalScore,
    EIGHT_GAME_HAND_TYPES 
} from '../utils/eightLogic';
import SpecialHandDialog from '../components/SpecialHandDialog';

// 根据牌型类型返回名称
const getHandTypeName = (type) => {
    const names = {
        [EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH]: '同花顺',
        [EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND]: '三条',
        [EIGHT_GAME_HAND_TYPES.STRAIGHT]: '顺子',
        [EIGHT_GAME_HAND_TYPES.PAIR]: '对子',
        [EIGHT_GAME_HAND_TYPES.HIGH_CARD]: '散牌',
    };
    return names[type] || '未知牌型';
}

function ClassicEightTable({ players, highlightId, editableRows, onConfirm, confirmEnabled, onSelectCard, selectedCard, onPlaceCard }) {
    return (
        <Box sx={{ width: '100%', mt: 2 }}>
            <Stack direction="row" spacing={2} justifyContent="center" alignItems="flex-start">
                {players.map((player) => (
                    <Paper key={player?.id} sx={{ p: 2, minWidth: 320, minHeight: 250, background: player?.id === highlightId ? 'rgba(255,255,200,0.13)' : 'rgba(255,255,255,0.05)', border: player?.id === highlightId ? '2px solid #ffd700' : '1px solid rgba(255,255,255,0.2)', boxShadow: player?.id === highlightId ? '0 0 10px #ffd700' : '' }}>
                        <Typography align="center" variant="subtitle1" sx={{ mb: 1, color: player?.id === highlightId ? '#ffd700' : '#fff', fontWeight: 'bold' }}>{player?.name}</Typography>
                        {player?.id === highlightId ? (
                            <>
                                <Typography color="primary" sx={{ mb: 1 }}>点击手牌进行选择</Typography>
                                <HandDisplay hand={player?.hand || []} onCardClick={onSelectCard} selectedCard={selectedCard} />
                                <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                                    <Box onClick={() => onPlaceCard('front')} sx={{ p: 1, border: '1px dashed grey', borderRadius: 1, cursor: 'pointer' }}><Typography>头道 (2)</Typography><HandDisplay hand={editableRows.front} /></Box>
                                    <Box onClick={() => onPlaceCard('middle')} sx={{ p: 1, border: '1px dashed grey', borderRadius: 1, cursor: 'pointer' }}><Typography>中道 (3)</Typography><HandDisplay hand={editableRows.middle} /></Box>
                                    <Box onClick={() => onPlaceCard('back')} sx={{ p: 1, border: '1px dashed grey', borderRadius: 1, cursor: 'pointer' }}><Typography>后道 (3)</Typography><HandDisplay hand={editableRows.back} /></Box>
                                </Box>
                                <Button sx={{ mt: 2, width: '100%' }} variant="contained" disabled={!confirmEnabled} onClick={onConfirm}>确认分牌</Button>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="caption">头道: {getHandTypeName(player?.rows?.frontType)}</Typography><HandDisplay hand={player?.rows?.front || []} />
                                <Typography variant="caption">中道: {getHandTypeName(player?.rows?.middleType)}</Typography><HandDisplay hand={player?.rows?.middle || []} />
                                <Typography variant="caption">后道: {getHandTypeName(player?.rows?.backType)}</Typography><HandDisplay hand={player?.rows?.back || []} />
                            </Box>
                        )}
                    </Paper>
                ))}
            </Stack>
        </Box>
    );
}

function ComparisonDialog({ open, players, mainPlayerId, onRestart }) {
    if (!open) return null;
    const mainPlayer = players.find(p => p?.id === mainPlayerId);
    const aiPlayer = players.find(p => p?.id !== mainPlayerId);
    if (!mainPlayer || !aiPlayer || !mainPlayer.rows || !aiPlayer.rows) return <Dialog open={open}><DialogTitle>等待玩家数据...</DialogTitle></Dialog>;

    const result = calculateEightGameTotalScore(mainPlayer.rows, aiPlayer.rows); // 【已修改】

    return (
        <Dialog open={open} fullWidth maxWidth="md">
            <DialogTitle align="center">比牌结果</DialogTitle>
            <DialogContent>
                <Stack direction="row" spacing={2} justifyContent="center">
                    {[mainPlayer, aiPlayer].map(p => (
                        <Paper key={p?.id} sx={{ p: 2, flex: 1 }}>
                            <Typography align="center" variant="h6">{p?.name}</Typography>
                            <Stack spacing={1} sx={{ mt: 1 }}>
                                <Box><Chip label={`头道: ${getHandTypeName(p?.rows.frontType)}`} size="small" /><HandDisplay hand={p?.rows.front || []} /></Box>
                                <Box><Chip label={`中道: ${getHandTypeName(p?.rows.middleType)}`} size="small" /><HandDisplay hand={p?.rows.middle || []} /></Box>
                                <Box><Chip label={`后道: ${getHandTypeName(p?.rows.backType)}`} size="small" /><HandDisplay hand={p?.rows.back || []} /></Box>
                            </Stack>
                        </Paper>
                    ))}
                </Stack>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="h5" color={result.playerAScore > 0 ? "success.main" : (result.playerAScore < 0 ? "error.main" : "text.primary")}>
                        {result.playerAScore > 0 ? `你赢了！总得 +${result.playerAScore} 水` : (result.playerAScore < 0 ? `你输了！总得 ${result.playerAScore} 水` : "平局！")}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: '#aaa' }}>{result.details.map(b => `【${b.area}】${b.winner === 'A' ? '胜' : (b.winner === 'B' ? '负' : '平')}`).join(' ')}</Typography>
                </Box>
            </DialogContent>
            <DialogActions><Button onClick={onRestart} variant="contained" size="large">再玩一局</Button></DialogActions>
        </Dialog>
    );
}

const EightGamePage = () => {
    const { players, currentPlayer, setPlayerArrangement, startGame } = useEightGame();
    const [rows, setRows] = useState({ front: [], middle: [], back: [] });
    const [isValid, setIsValid] = useState(false);
    const [specialHand, setSpecialHand] = useState(null);
    const [showSpecialDialog, setShowSpecialDialog] = useState(false);
    const [allReady, setAllReady] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    useEffect(() => {
        if (currentPlayer?.hand) {
            setRows({ front: [], middle: [], back: [] });
            setIsValid(false);
            setAllReady(false);
            setSelectedCard(null);
            const detectedSpecial = checkForEightGameSpecialHand(currentPlayer.hand); // 【已修改】
            if (detectedSpecial) {
                setSpecialHand(detectedSpecial);
                setShowSpecialDialog(true);
            } else {
                setSpecialHand(null);
                setShowSpecialDialog(false);
            }
        }
    }, [currentPlayer]);

    useEffect(() => {
        if (players?.length > 0 && players.every(p => p?.isReady)) {
            setAllReady(true);
        }
    }, [players]);

    const handleSelectCard = (card) => setSelectedCard(card?.id === selectedCard?.id ? null : card);
    
    const handlePlaceCard = (targetRow) => {
        if (!selectedCard) return;
        let newRows = { ...rows };
        Object.keys(newRows).forEach(row => { newRows[row] = newRows[row].filter(c => c?.id !== selectedCard.id); });
        const handWithoutSelected = currentPlayer?.hand.filter(c => c?.id !== selectedCard.id);
        newRows[targetRow] = [...newRows[targetRow], selectedCard];
        setRows(newRows);
        setIsValid(validateEightGameArrangement(newRows).isValid); // 【已修改】
        setSelectedCard(null);
    };

    const handleConfirm = () => {
        const validation = validateEightGameArrangement(rows); // 【已修改】
        if (validation.isValid) {
            setPlayerArrangement(currentPlayer?.id, rows);
        } else {
            alert(validation.message || "分牌不合法，请检查！");
        }
    };

    const handleRestart = () => startGame();

    if (!currentPlayer || !players || players.length === 0) {
        return <Typography sx={{ color: 'white', mt: 2, textAlign: 'center' }}>正在加载游戏...</Typography>;
    }

    return (
        <Box sx={{ background: 'linear-gradient(to bottom, #232526, #414345)', minHeight: '100vh', color: 'white', p: 2 }}>
            {allReady ? (
                <ComparisonDialog open={allReady} players={players} mainPlayerId={currentPlayer?.id} onRestart={handleRestart} />
            ) : (
                <>
                    <Typography variant="h4" align="center">八张牌游戏</Typography>
                    <ClassicEightTable players={players} highlightId={currentPlayer?.id} editableRows={rows} onConfirm={handleConfirm} confirmEnabled={isValid} onSelectCard={handleSelectCard} selectedCard={selectedCard} onPlaceCard={handlePlaceCard} />
                    <SpecialHandDialog open={showSpecialDialog} specialHandName={specialHand?.name} onClose={() => setShowSpecialDialog(false)} onConfirm={() => setShowSpecialDialog(false)} />
                    <Box sx={{ mt: 3, textAlign: 'center', color: '#bbb' }}>
                        <Typography>玩法: 先点击你的手牌, 再点击目标牌道(头/中/后)进行分配。</Typography>
                        {selectedCard && <Typography color="primary">已选择: {selectedCard?.id?.replace('_', ' ')}</Typography>}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default EightGamePage;
