// frontend/src/games/eight/components/EightComparisonDisplay.jsx
import React from 'react';
import { Box, Typography, Button, Paper, Grid, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EightCompactHandDisplay from './EightCompactHandDisplay'; // Import the new compact display

const EightComparisonDisplay = ({ result, onRestart }) => {
    const navigate = useNavigate();
    if (!result) return null;

    const { players, details, specialWinner, handInfo, matchupScores } = result;

    const handleExit = () => navigate('/');

    // Prioritize showing the human player first
    const sortedPlayers = [...players].sort((a, b) => {
        if (a.id === 'player') return -1;
        if (b.id === 'player') return 1;
        return 0;
    });

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

            {/* Grid layout for 2x3 display on small screens and up */}
            <Grid container spacing={{ xs: 1, sm: 2 }}>
                {sortedPlayers.map(player => (
                    <Grid item xs={6} sm={4} key={player.id}>
                        <EightCompactHandDisplay 
                            player={player} 
                            details={details ? details[player.id] : null}
                        />
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