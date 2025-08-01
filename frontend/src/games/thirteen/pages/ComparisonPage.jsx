import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { useGame } from '../context/GameContext';
import { Link } from 'react-router-dom';
import ThirteenHandDisplay from '../components/ThirteenHandDisplay';

function ComparisonPage() {
    const { players } = useGame();

    return (
        <Box className="page-container-new-ui" sx={{ color: 'white', p: 2 }}>
            <Typography variant="h4" align="center" sx={{ mt: 2, mb: 2 }}>比牌结果</Typography>
            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                {players.map(p => (
                    <Box key={p.id} sx={{ p: 2, minWidth: 260, background: 'rgba(255,255,255,0.08)', borderRadius: 2, border: '2px solid rgba(255,255,255,0.15)' }}>
                        <Typography variant="subtitle1" align="center">{p.name}</Typography>
                        <ThirteenHandDisplay hand={p.rows.front || []} />
                        <ThirteenHandDisplay hand={p.rows.middle || []} />
                        <ThirteenHandDisplay hand={p.rows.back || []} />
                    </Box>
                ))}
            </Stack>
            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button variant="contained" component={Link} to="/thirteen/play">返回游戏</Button>
            </Box>
        </Box>
    );
}

export default ComparisonPage;