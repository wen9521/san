import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useGame } from '../context/GameContext';
import { Link } from 'react-router-dom';
import HandDisplay from '../components/HandDisplay';

function ComparisonPage() {
    const { players } = useGame();

    return (
        <Box sx={{ p: 2, color: 'white' }}>
            <Typography variant="h4">比牌结果</Typography>
            {players.map(p => (
                <Box key={p.id} sx={{ my: 2 }}>
                    <Typography variant="h6">{p.name}</Typography>
                    <HandDisplay hand={p.rows.front || []} />
                    <HandDisplay hand={p.rows.middle || []} />
                    <HandDisplay hand={p.rows.back || []} />
                </Box>
            ))}
            <Button variant="contained" component={Link} to="/thirteen/play">返回游戏</Button>
        </Box>
    );
}

export default ComparisonPage;