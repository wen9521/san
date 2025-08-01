import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { useGame } from '../context/GameContext';
import { Link } from 'react-router-dom';
import ThirteenHandDisplay from '../components/ThirteenHandDisplay';

function ComparisonPage() {
    const { players } = useGame();
    const cardWidth = 60; // 缩小卡牌尺寸
    const cardHeight = 84;

    return (
        <Box className="page-container-new-ui" sx={{ color: 'white', p: 1, overflowY: 'auto' }}>
            <Typography variant="h5" align="center" sx={{ mt: 1, mb: 2 }}>比牌结果</Typography>
            <Grid container spacing={1} justifyContent="center">
                {players.map(p => (
                    <Grid item xs={6} sm={6} md={6} key={p.id}>
                        <Box sx={{ p: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.15)', height: '100%' }}>
                            <Typography variant="subtitle2" align="center" sx={{ fontWeight: 'bold' }}>{p.name}</Typography>
                            <ThirteenHandDisplay hand={p.rows.front || []} cardWidth={cardWidth} cardHeight={cardHeight} />
                            <ThirteenHandDisplay hand={p.rows.middle || []} cardWidth={cardWidth} cardHeight={cardHeight} />
                            <ThirteenHandDisplay hand={p.rows.back || []} cardWidth={cardWidth} cardHeight={cardHeight} />
                        </Box>
                    </Grid>
                ))}
            </Grid>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="contained" component={Link} to="/thirteen/play">返回游戏</Button>
            </Box>
        </Box>
    );
}

export default ComparisonPage;