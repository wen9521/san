import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { useGame } from '../context/GameContext';

const PlayerStatus = () => {
    const { players } = useGame();

    return (
        <Grid container spacing={1} sx={{ mb: 2 }}>
            {players.map(player => (
                <Grid item xs={3} key={player.id}>
                    <Paper 
                        sx={{ 
                            p: 1, 
                            textAlign: 'center',
                            backgroundColor: 'rgba(46, 125, 50, 0.7)', // 绿色半透明
                            border: player.id === 'player' ? '2px solid #ffab40' : '2px solid transparent'
                        }}
                    >
                        <Typography variant="body1" fontWeight="bold">{player.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {player.isReady ? '已理牌' : '理牌中'}
                        </Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
};

export default PlayerStatus;