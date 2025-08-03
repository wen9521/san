import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import  ThirteenPokerCard  from './ThirteenPokerCard';

// A single, reusable row for displaying a small hand of cards (like front, middle, or back)
const CompactCardRow = ({ cards }) => {
    if (!cards || cards.length === 0) {
        return <Box sx={{ minHeight: '84px', width: '100%' }} />;
    }
    const cardWidth = 60;
    const overlap = cardWidth * 0.7; // 70% overlap

    return (
        <Stack
            direction="row"
            spacing={`-${overlap}px`}
            sx={{
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                py: 0.5
            }}
        >
            {cards.map((card, index) => (
                <Box
                    key={card.id}
                    sx={{
                        zIndex: 10 + index,
                    }}
                >
                    <ThirteenPokerCard card={card} width={cardWidth} height={84} />
                </Box>
            ))}
        </Stack>
    );
};

/**
 * A self-contained component to display a single opponent's complete, arranged hand.
 * It takes a single `player` object and renders their name and all three rows.
 */
const ThirteenCompactHandDisplay = ({ player }) => {
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
            <Stack spacing={1} sx={{ flexGrow: 1 }}>
                {['back', 'middle', 'front'].map(area => (
                    <CompactCardRow key={area} cards={player.rows[area]} />
                ))}
            </Stack>
        </Paper>
    );
};

export default ThirteenCompactHandDisplay;
