import React from 'react';
import { Box, Typography } from '@mui/material';
import { EightPokerCard } from './EightPokerCard';

export const EightGameRow = ({ id, label, cards, onCardClick, onRowClick, selectedCardIds, typeName, small, compact = false }) => {
    
    // Using the exact styling from Thirteen's compact display for consistency
    const renderCompactCards = () => (
        <Box sx={{ display: 'flex', position: 'relative', width: `${cards.length * 20 + 30}px`, height: '60px' }}>
            {cards.map((card, index) => (
                <Box
                    key={card.id}
                    sx={{
                        position: 'absolute',
                        left: `${index * 20}px`, // Consistent overlap
                        zIndex: index,
                        height: '100%',
                    }}
                >
                    <EightPokerCard
                        card={card}
                        isSelectable={false}
                        size="small" // Standard small size
                    />
                </Box>
            ))}
        </Box>
    );

    const renderNormalCards = () => (
         <Box
            onClick={() => onRowClick && onRowClick(id)}
            sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                minHeight: '80px', // Standard height
                borderRadius: '8px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                cursor: onRowClick ? 'pointer' : 'default',
                gap: 1
            }}
        >
            {label && <Typography sx={{ width: '80px', color: 'white', textAlign: 'center' }}>{label}<br/>{typeName}</Typography>}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {cards.map(card => (
                    <EightPokerCard
                        key={card.id}
                        card={card}
                        isSelected={selectedCardIds && selectedCardIds.includes(card.id)}
                        onClick={onCardClick}
                        isSelectable={!!onCardClick}
                        size={"medium"} // Standard medium size
                    />
                ))}
            </Box>
        </Box>
    );

    if (compact) {
        return renderCompactCards();
    }
    
    return renderNormalCards();
};