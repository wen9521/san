// frontend/src/games/eight/components/EightComparisonDisplay.jsx
import React from 'react';
import { Box, Button, Grid, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EightCompactHandDisplay from './EightCompactHandDisplay';

const EightComparisonDisplay = ({ result, onRestart }) => {
    const navigate = useNavigate();
    if (!result) return null;

    const { players, details } = result;
    const handleExit = () => navigate('/');

    const sortedPlayers = [...players].sort((a, b) => {
        if (a.id === 'player') return -1;
        if (b.id === 'player') return 1;
        return 0;
    });

    return (
        <Box 
            className="page-container-new-ui" 
            sx={{ 
                color: 'white', 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column',
                height: '100vh', // Full viewport height
                p: { xs: 1, sm: 2 }
            }}
        >
            <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ flexGrow: 1 }} alignItems="stretch">
                {sortedPlayers.map(player => (
                    <Grid item xs={6} sm={4} key={player.id} sx={{ display: 'flex' }}>
                        <EightCompactHandDisplay 
                            player={player} 
                            details={details ? details[player.id] : null}
                        />
                    </Grid>
                ))}
            </Grid>
            
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 'auto', pt: 2 }}>
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
