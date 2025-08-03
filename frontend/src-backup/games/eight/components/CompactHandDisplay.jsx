import React from 'react';
import { Box } from '@mui/material';

// This component displays cards in a compact, vertically stacked manner,
// showing only the top portion of each card.
const CompactHandDisplay = ({ hand }) => {
    if (!hand || hand.length === 0) {
        return null;
    }

    const CARD_WIDTH = 60; // Using smaller cards for this compact view
    const CARD_HEIGHT = 84;
    // Overlap to show approx. top 25-30% of the card
    const OVERLAP_PERCENTAGE = 0.7; 
    const VISIBLE_HEIGHT = CARD_HEIGHT * (1 - OVERLAP_PERCENTAGE);

    return (
        <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            my: 1, 
            // Calculate the total height required for the stack
            minHeight: `${CARD_HEIGHT + (hand.length - 1) * VISIBLE_HEIGHT}px`,
            position: 'relative' 
        }}>
            {hand.map((card, index) => (
                <Box
                    key={card.id}
                    sx={{
                        position: 'absolute',
                        top: `${index * VISIBLE_HEIGHT}px`,
                        width: `${CARD_WIDTH}px`,
                        height: `${CARD_HEIGHT}px`,
                        zIndex: index,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}
                >
                    <img
                        src={`/assets/cards/${card.id}.svg`}
                        alt={card.id}
                        style={{ width: '100%', height: '100%' }}
                    />
                </Box>
            ))}
        </Box>
    );
};

export default CompactHandDisplay;