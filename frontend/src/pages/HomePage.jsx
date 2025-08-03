import React from 'react';
import { Box, Button, Typography, Container, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * The main landing page of the application.
 * Provides navigation to the different games.
 */
function HomePage() {
    const navigate = useNavigate();

    // These will navigate to the game pages once they are created
    const handlePlayThirteen = () => navigate('/thirteen/play');
    const handlePlayEight = () => navigate('/eight/play');

    return (
        <Box 
            className="page-container"
        >
            <Container maxWidth="sm" className="glass-effect">
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', textShadow: '2px 2px 4px #000000' }}>
                    扑克牌游戏中心
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.8 }}>
                    选择一个游戏开始
                </Typography>
                <Stack spacing={2} direction="column" alignItems="stretch">
                    <Button variant="contained" color="primary" size="large" onClick={handlePlayThirteen} disabled>
                        十三张 (重构中...)
                    </Button>
                    <Button variant="contained" color="secondary" size="large" onClick={handlePlayEight} disabled>
                        八张 (重构中...)
                    </Button>
                </Stack>
            </Container>
        </Box>
    );
}

export default HomePage;
