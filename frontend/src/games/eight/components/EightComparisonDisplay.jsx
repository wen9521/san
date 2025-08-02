// frontend/src/games/eight/components/EightComparisonDisplay.jsx
import React from 'react';
import { Box, Typography, Button, Paper, Grid, Stack, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { EightGameRow } from './EightGameRow';
import { getHandTypeName } from '../utils/eightLogic';

const PlayerComparisonCard = ({ player, details, matchupScore }) => {
    // 如果没有对战分数，则不显示此玩家卡片 (适用于旧逻辑或特殊情况)
    if (matchupScore === undefined) return null;

    const getPointColor = (points) => {
        if (points > 0) return 'success.light';
        if (points < 0) return 'error.light';
        return 'text.secondary';
    };

    return (
        <Paper elevation={3} sx={{ p: 1.5, backgroundColor: 'rgba(0, 0, 0, 0.3)', color: 'white' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{player.name}</Typography>
                {/* 使用单挑分数 */}
                <Typography variant="h6" sx={{ color: getPointColor(matchupScore), fontWeight: 'bold' }}>
                    {matchupScore > 0 ? `+${matchupScore}` : matchupScore}
                </Typography>
            </Stack>
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
            <Stack spacing={0.5} alignItems="center">
                {['back', 'middle', 'front'].map(area => (
                    <Box key={area} sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack sx={{ flex: 1, alignItems: 'center' }}>
                           <EightGameRow cards={player.rows[area]} compact />
                           {/* 在常规比牌中显示牌型和每道得分 */}
                           {details && details[player.id] && (
                                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'lightgray' }}>
                                   {getHandTypeName(details[player.id][area]?.handEval)}
                               </Typography>
                           )}
                        </Stack>
                        {details && details[player.id] && (
                            <Typography sx={{ width: '40px', textAlign: 'right', fontWeight: 'bold', color: getPointColor(details[player.id][area]?.points) }}>
                                {details[player.id][area]?.points > 0 ? `+${details[player.id][area]?.points}` : details[player.id][area]?.points || 0}
                            </Typography>
                        )}
                    </Box>
                ))}
            </Stack>
        </Paper>
    );
};

const EightComparisonDisplay = ({ result, onRestart }) => {
    const navigate = useNavigate();
    if (!result) return null;

    const { players, details, specialWinner, matchupScores, handInfo } = result;

    const handleExit = () => navigate('/');
    
    // 把"我"和其他玩家分开
    const humanPlayer = players.find(p => p.id === 'player');
    const aiPlayers = players.filter(p => p.id !== 'player');

    return (
        <Box className="page-container-new-ui" sx={{ p: { xs: 1, sm: 2 }, color: 'white', overflowY: 'auto' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                比牌结果
            </Typography>

            {specialWinner && (
                <Paper elevation={3} sx={{ p: 2, mb: 2, textAlign: 'center', background: 'linear-gradient(45deg, #FFD700, #FF8C00)' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'black' }}>
                        🎉 特殊牌型获胜! 🎉
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'black' }}>
                        玩家 {specialWinner.name} 以 "{handInfo.name}" 获胜!
                    </Typography>
                </Paper>
            )}

            <Grid container spacing={{ xs: 1, sm: 2 }}>
                {/* 首先渲染"我" */}
                {humanPlayer && (
                    <Grid item xs={12} sm={6} md={4}>
                         <PlayerComparisonCard player={humanPlayer} details={details} matchupScore={matchupScores[humanPlayer.id]} />
                    </Grid>
                )}
                 {/* 渲染其他AI玩家 */}
                {aiPlayers.map(player => (
                    <Grid item xs={6} sm={4} md={4} key={player.id}>
                        <PlayerComparisonCard player={player} details={details} matchupScore={matchupScores[player.id]} />
                    </Grid>
                ))}
            </Grid>
            
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: { xs: 2, sm: 3 } }}>
                <Button variant="contained" size="large" color="success" onClick={onRestart}>
                    再来一局
                </Button>
                <Button variant="outlined" size="large" color="warning" onClick={handleExit}>
                    退出游戏
                </Button>
            </Stack>
        </Box>
    );
};

export default EightComparisonDisplay;