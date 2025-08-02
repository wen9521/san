// frontend/src/games/eight/components/EightComparisonDisplay.jsx
import React from 'react';
import { Box, Typography, Button, Paper, Grid, Stack } from '@mui/material';
import { EightGameRow } from './EightGameRow';
import { getHandTypeName } from '../utils/eightLogic';

const PlayerComparisonCard = ({ player, details }) => {
    if (!details) return null;

    const totalScore = details.front.points + details.middle.points + details.back.points;

    const getPointColor = (points) => {
        if (points > 0) return 'success.main';
        if (points < 0) return 'error.main';
        return 'text.secondary';
    }

    return (
        <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ color: 'white' }}>{player.name}</Typography>
                <Typography variant="h6" sx={{ color: getPointColor(totalScore), fontWeight: 'bold' }}>
                    {totalScore > 0 ? `+${totalScore}` : totalScore} 分
                </Typography>
            </Stack>
            <Stack spacing={1}>
                {[ 'front', 'middle', 'back' ].map(area => (
                    <Box key={area} sx={{ borderRadius: 1, p: 1, backgroundColor: 'rgba(0,0,0,0.2)'}}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                             <Typography variant="body2" sx={{ color: 'lightgray' }}>
                                {getHandTypeName(details[area].handEval)}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: getPointColor(details[area].points) }}>
                                {details[area].points > 0 ? `+${details[area].points}` : details[area].points}
                            </Typography>
                        </Stack>
                        <EightGameRow cards={player.rows[area]} small />
                    </Box>
                ))}
            </Stack>
        </Paper>
    );
};


const EightComparisonDisplay = ({ result, onRestart }) => {
    if (!result) return null;

    const { scores, players, details, specialWinner } = result;

    return (
        <Box className="page-container-new-ui" sx={{ p: 2, color: 'white', overflowY: 'auto' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                比牌结果
            </Typography>

            {specialWinner && (
                <Paper elevation={3} sx={{ p: 3, mb: 3, textAlign: 'center', background: 'linear-gradient(45deg, #FFD700, #FF8C00)' }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'black' }}>
                        🎉 特殊牌型获胜! 🎉
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'black' }}>
                        玩家 {specialWinner.name} 以 "{result.scores.find(s=>s.playerId === specialWinner.id).handInfo.name}" 获胜!
                    </Typography>
                </Paper>
            )}

            <Grid container spacing={2}>
                {players.map(player => (
                    <Grid item xs={12} sm={6} md={4} key={player.id}>
                        <PlayerComparisonCard player={player} details={details ? details[player.id] : null} />
                    </Grid>
                ))}
            </Grid>
            
            <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Button variant="contained" size="large" color="success" onClick={onRestart}>
                    再来一局
                </Button>
            </Box>
        </Box>
    );
};

export default EightComparisonDisplay;