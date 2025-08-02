// frontend/src/games/eight/components/EightCompactHandDisplay.jsx
import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { EightPokerCard } from './EightPokerCard';

const CompactCardRow = ({ cards }) => {
    if (!cards || cards.length === 0) return <Box sx={{ minHeight: '80px' }} />; // Set a min-height

    const overlap = 0.6; // 60% overlap

    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            position: 'relative',
        }}>
            {cards.map((card, index) => (
                <Box
                    key={card.id}
                    sx={{
                        position: index === 0 ? 'relative' : 'absolute',
                        left: index === 0 ? '0' : `${index * (100 - overlap * 100) / (cards.length -1)}%`,
                        width: '35%', // Relative width
                        height: 'auto',
                        zIndex: index,
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'scale(1.1) translateY(-5px)',
                            zIndex: cards.length + 1,
                        }
                    }}
                >
                    <EightPokerCard card={card} isSelectable={false} />
                </Box>
            ))}
        </Box>
    );
};

const EightCompactHandDisplay = ({ player }) => {
    if (!player) return null;
    
    return (
        <Paper 
            elevation={3} 
            sx={{ 
                p: 1, 
                backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                color: 'white', 
                width: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
                {player.name}
            </Typography>
            
            <Stack sx={{ flexGrow: 1, height: '100%', justifyContent: 'space-around' }} spacing={1}>
                {['front', 'middle', 'back'].map(area => (
                    <Box key={area} sx={{ height: '30%', width: '100%'}}>
                        <CompactCardRow cards={player.rows[area]} />
                    </Box>
                ))}
            </Stack>
        </Paper>
    );
};

export default EightCompactHandDisplay;