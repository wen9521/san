import React from 'react';
import { Box, Typography, Container, Button, Paper, Grid, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import PokerCard from '../components/PokerCard';
import '../styles/App.css';

const PlayerResultCard = ({ player }) => {
    const { details, scores } = player;

    const renderRow = (rowName, label) => (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">{label}</Typography>
                <Chip label={details[rowName].name} color="secondary" size="small" />
                <Chip label={`得分: ${scores[rowName]}`} color={scores[rowName] > 0 ? 'success' : scores[rowName] < 0 ? 'error' : 'default'} size="small" />
            </Box>
            <Box className="game-row-content">
                {details[rowName].cards.map((card, i) => (
                    <PokerCard key={card.id} cardData={card} index={i} />
                ))}
            </Box>
        </Box>
    );

    return (
        <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {player.name}
                <Chip label={`总分: ${scores.total > 0 ? `+${scores.total}` : scores.total}`} color="primary" sx={{ fontSize: '1rem' }}/>
            </Typography>
            {renderRow('back', '后道')}
            {renderRow('middle', '中道')}
            {renderRow('front', '前道')}
        </Paper>
    );
};

function ComparisonPage() {
    const navigate = useNavigate();
    const { comparisonResult, isGameActive } = useGame();

    if (!isGameActive || !comparisonResult) {
        return (
            <Container className="page-container">
                <Typography variant="h4" color="white">没有有效的牌局结果。请开始新游戏。</Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/thirteen')}>返回游戏</Button>
            </Container>
        );
    }
    
    return (
        <Container className="page-container" maxWidth="lg">
            <Typography variant="h2" gutterBottom color="primary.main" textAlign="center">比牌结果</Typography>
            <Grid container spacing={3}>
                {comparisonResult.map(player => (
                    <Grid item xs={12} md={6} key={player.id}>
                        <PlayerResultCard player={player} />
                    </Grid>
                ))}
            </Grid>
            <Button variant="contained" size="large" sx={{ mt: 4 }} onClick={() => navigate('/thirteen')}>
                开始新一局
            </Button>
        </Container>
    );
}

export default ComparisonPage;