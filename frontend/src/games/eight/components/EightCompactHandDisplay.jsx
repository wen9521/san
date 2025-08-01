import React from 'react';
import { Box } from '@mui/material';
import { EightPokerCard } from './EightPokerCard';

const EightCompactHandDisplay = ({ hand, cardWidth = 50, cardHeight = 70 }) => {
    if (!hand || hand.length === 0) {
        return <Box sx={{ height: `${cardHeight}px`, m: 0.5 }} />;
    }

    const overlap = cardWidth * 0.6; // 60% overlap
    const containerWidth = cardWidth + (hand.length - 1) * (cardWidth - overlap);

    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            my: 0.5, 
            minHeight: `${cardHeight}px` 
        }}>
            <Box sx={{ position: 'relative', width: `${containerWidth}px`, height: `${cardHeight}px` }}>
                {hand.map((card, index) => (
                    <Box
                        key={card.id}
                        sx={{
                            position: 'absolute',
                            left: `${index * (cardWidth - overlap)}px`,
                            zIndex: 10 + index,
                        }}
                    >
                        <EightPokerCard
                            card={card}
                            width={cardWidth}
                            height={cardHeight}
                        />
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default EightCompactHandDisplay;
