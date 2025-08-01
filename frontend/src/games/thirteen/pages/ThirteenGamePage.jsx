import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useGame } from '../context/GameContext';
import { Link } from 'react-router-dom';
import HandDisplay from '../components/HandDisplay';

function ThirteenGamePage() {
    const { players, startGame } = useGame();
    const player = players.find(p => p.id === 'player');

    if (!player) {
        return <Box><CircularProgress /><Typography>正在创建十三张牌局...</Typography></Box>;
    }

    return (
        <Box sx={{ p: 2, color: 'white' }}>
            <Typography variant="h4">十三张游戏</Typography>
            <Typography>玩家: {player.name}</Typography>
            <Typography>手牌数: {player.hand.length}</Typography>
            <HandDisplay hand={player.hand} />
            <Button variant="contained" component={Link} to="/thirteen/comparison">比牌</Button>
            <Button variant="outlined" onClick={startGame} sx={{ ml: 2 }}>重新开始</Button>
        </Box>
    );
}

export default ThirteenGamePage;