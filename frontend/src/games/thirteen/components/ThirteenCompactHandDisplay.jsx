import React from 'react';
import { Box, Stack } from '@mui/material';
import { ThirteenPokerCard } from './ThirteenPokerCard';

const ThirteenCompactHandDisplay = ({ hand, cardWidth = 60, cardHeight = 84 }) => {
    if (!hand || hand.length === 0) {
        return <Box sx={{ height: `${cardHeight}px`, m: 0.5 }} />;
    }

    const overlap = cardWidth * 0.7; // 70% overlap
    const cardSpacing = cardWidth * (1 - 0.7); // 30% of card width for spacing

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            my: 0.5,
            minHeight: `${cardHeight}px`
        }}>
            <Stack direction="row" spacing={`${-overlap}px`} sx={{ height: `${cardHeight}px` }}>
                {hand.map((card, index) => (
                     <Box
                        key={card.id}
                        sx={{
                            position: 'absolute',
                            left: `${index * (cardWidth - overlap)}px`,
                            zIndex: 10 + index,
                        }}
                    >
                        <ThirteenPokerCard
                            card={card}
                            width={cardWidth}
                            height={cardHeight}
                        />
                    </Box>
                ))}
            </Stack>
        </Box>
    );
};

export default ThirteenCompactHandDisplay;
