import React from 'react';
import { Box, Typography, Button, Grid } from '@mui/material';
import { useGame } from '../context/GameContext';
import { Link, useNavigate } from 'react-router-dom';
import ThirteenCompactHandDisplay from '../components/ThirteenCompactHandDisplay';

function ComparisonPage() {
    const { players, startGame } = useGame();
    const navigate = useNavigate();

    return (
        <Box className="page-container-new-ui" sx={{ display: 'flex', flexDirection: 'column', height: '100vh', p: 1, boxSizing: 'border-box' }}>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', pb: '80px' }}>
                <Grid container spacing={1} justifyContent="center">
                    {players.map(p => (
                        <Grid item xs={6} sm={6} key={p.id}>
                            <Box sx={{ p: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 2, border: '1px solid rgba(255,255,255,0.15)', height: '100%' }}>
                                <Typography variant="subtitle2" align="center" sx={{ fontWeight: 'bold', color: 'white' }}>{p.name}</Typography>
                                <ThirteenCompactHandDisplay hand={p.rows.front || []} />
                                <ThirteenCompactHandDisplay hand={p.rows.middle || []} />
                                <ThirteenCompactHandDisplay hand={p.rows.back || []} />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Box>
            <Box sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <Button variant="contained" onClick={startGame} sx={{ mr: 2 }}>再来一局</Button>
                <Button variant="outlined" component={Link} to="/thirteen/play" sx={{ mr: 2 }}>返回游戏</Button>
                <Button variant="outlined" onClick={() => navigate('/')}>返回大厅</Button>
            </Box>
        </Box>
    );
}

export default ComparisonPage;