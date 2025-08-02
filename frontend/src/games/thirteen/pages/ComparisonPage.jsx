import React, { useEffect } from 'react';
import { Box, Typography, Button, Grid, Paper, Stack, Divider } from '@mui/material';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import ThirteenCompactHandDisplay from '../components/ThirteenCompactHandDisplay';
import { getHandType } from '../utils/thirteenLogic'; // Import this to show hand types

const PlayerComparisonCard = ({ player, details, matchupScore }) => {
    if (matchupScore === undefined) return null;

    const getPointColor = (points) => {
        if (points > 0) return 'success.light';
        if (points < 0) return 'error.light';
        return 'text.secondary';
    };

    return (
        <Paper elevation={3} sx={{ p: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)', color: 'white', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{player.name}</Typography>
                <Typography variant="h6" sx={{ color: getPointColor(matchupScore), fontWeight: 'bold' }}>
                    {matchupScore > 0 ? `+${matchupScore}` : matchupScore}
                </Typography>
            </Stack>
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
            
            {['front', 'middle', 'back'].map(area => {
                const handEval = getHandType(player.rows[area]);
                const pointDetails = player.id === 'player' 
                    ? details[player.id] && Object.values(details[player.id]).map(d => d.find(x => x.row === area)?.points || 0).reduce((a,b) => a+b, 0)
                    : details[player.id] && details[player.id][player.id]?.find(x => x.row === area)?.points || 0;

                return (
                    <Box key={area} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 0.5 }}>
                        <Box>
                            <ThirteenCompactHandDisplay hand={player.rows[area]} />
                            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'lightgray' }}>
                                {handEval?.type} {handEval?.isSpecial ? `(+${handEval.points})` : ''}
                            </Typography>
                        </Box>
                        {details && (
                             <Typography sx={{ fontWeight: 'bold', color: getPointColor(pointDetails) }}>
                                {pointDetails > 0 ? `+${pointDetails}` : pointDetails}
                            </Typography>
                        )}
                    </Box>
                )
            })}
        </Paper>
    );
};

function ComparisonPage() {
    const { players, startGame, comparisonResult, startComparison } = useGame();
    const navigate = useNavigate();

    useEffect(() => {
        // Automatically start comparison when the page loads
        if (!comparisonResult) {
            startComparison();
        }
    }, [comparisonResult, startComparison]);

    if (!comparisonResult) {
        return <Box className="page-container-new-ui"><Typography sx={{color: 'white'}}>正在计算比牌结果...</Typography></Box>;
    }

    const { matchupScores, details } = comparisonResult;
    const humanPlayer = players.find(p => p.id === 'player');
    const aiPlayers = players.filter(p => p.id !== 'player');

    return (
        <Box className="page-container-new-ui" sx={{ p: { xs: 1, sm: 2 }, overflowY: 'auto' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
                比牌结果
            </Typography>

            <Grid container spacing={{ xs: 1, sm: 2 }}>
                {humanPlayer && (
                    <Grid item xs={6} md={3}>
                        <PlayerComparisonCard player={humanPlayer} details={details} matchupScore={matchupScores[humanPlayer.id]} />
                    </Grid>
                )}
                {aiPlayers.map(player => (
                    <Grid item xs={6} md={3} key={player.id}>
                        <PlayerComparisonCard player={player} details={details} matchupScore={matchupScores[player.id]} />
                    </Grid>
                ))}
            </Grid>
            
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: { xs: 2, sm: 3 } }}>
                <Button variant="contained" size="large" color="success" onClick={startGame}>再来一局</Button>
                <Button variant="outlined" size="large" color="warning" onClick={() => navigate('/')}>退出游戏</Button>
            </Stack>
        </Box>
    );
}

export default ComparisonPage;