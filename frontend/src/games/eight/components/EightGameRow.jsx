import React from 'react';
import { Box, Typography } from '@mui/material';
import { EightPokerCard } from './EightPokerCard'; // Assuming this is your card component

// EightGameRow is used in both the game table and the comparison screen.
// We'll add a 'compact' prop to switch between layouts.
export const EightGameRow = ({ id, label, cards, onCardClick, onRowClick, selectedCardIds, typeName, small, compact = false }) => {
    
    const renderCompactCards = () => (
        <Box sx={{ display: 'flex', position: 'relative', width: `${cards.length * 18 + 22}px`, height: '40px' }}>
            {cards.map((card, index) => (
                <Box
                    key={card.id}
                    sx={{
                        position: 'absolute',
                        left: `${index * 18}px`, // Overlap cards
                        zIndex: index,
                        height: '100%',
                    }}
                >
                    <EightPokerCard
                        card={card}
                        isSelectable={false}
                        size="small" // Use smaller cards
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
                p: small ? 0.5 : 1,
                minHeight: small ? '40px' : '80px',
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
                        size={small ? "small" : "medium"}
                    />
                ))}
            </Box>
        </Box>
    );

    // If compact, render the stacked version.
    if (compact) {
        return renderCompactCards();
    }
    
    // Otherwise, render the original version.
    return renderNormalCards();
};