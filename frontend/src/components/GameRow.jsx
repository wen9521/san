import React, { useState, useRef, useLayoutEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { PokerCard } from './PokerCard';

export const GameRow = ({ id, cards, label, onRowClick, selectedCardIds, onCardClick, typeName }) => {
    const CARD_WIDTH = 80;
    const CARD_HEIGHT = 112;
    const containerRef = useRef(null);
    const [overlap, setOverlap] = useState(40);

    useLayoutEffect(() => {
        const calculateOverlap = () => {
            if (!containerRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            const numCards = cards.length;
            const reservedSpace = CARD_WIDTH / 1.5; // Reserve space for text and drop zone
            const availableWidth = containerWidth - reservedSpace;

            if (numCards <= 1) {
                setOverlap(0);
                return;
            }
            
            const totalCardsWidth = numCards * CARD_WIDTH;

            if (totalCardsWidth <= availableWidth) {
                setOverlap(5); // A small, fixed overlap when cards fit
            } else {
                const requiredOverlap = (totalCardsWidth - availableWidth) / (numCards - 1);
                setOverlap(Math.max(20, requiredOverlap)); // Ensure a minimum overlap
            }
        };

        calculateOverlap();
        window.addEventListener('resize', calculateOverlap);

        return () => window.removeEventListener('resize', calculateOverlap);
    }, [cards.length, CARD_WIDTH]);

    return (
        <Box 
            sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                minHeight: `${CARD_HEIGHT + 20}px`,
                display: 'flex',
                alignItems: 'center',
                padding: '10px 15px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                    background: 'rgba(0, 255, 0, 0.15)',
                },
                position: 'relative',
                overflow: 'hidden'
            }}
            onClick={() => onRowClick(id)}
        >
            {/* Cards container */}
            <Box
                ref={containerRef}
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    height: `${CARD_HEIGHT}px`,
                }}
            >
                {cards.map((card, index) => (
                    <Box 
                        key={card.id}
                        sx={{
                            position: 'absolute',
                            left: `${index * (CARD_WIDTH - overlap)}px`,
                            zIndex: selectedCardIds?.includes(card.id) ? 100 + index : 10 + index, // Higher z-index for cards
                            transition: 'left 0.3s ease, transform 0.2s ease',
                            transform: selectedCardIds?.includes(card.id) ? 'translateY(-15px)' : 'none',
                        }}
                    >
                        <PokerCard 
                            card={card} 
                            isSelected={selectedCardIds?.includes(card.id)} 
                            onClick={onCardClick}
                            width={CARD_WIDTH}
                            height={CARD_HEIGHT}
                        />
                    </Box>
                ))}
            </Box>

            {/* Label on the right, under the cards */}
            <Box sx={{ 
                position: 'absolute',
                right: '25px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '120px', 
                textAlign: 'center', 
                color: 'rgba(255, 255, 255, 0.4)',
                flexShrink: 0, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1, // Lower z-index
            }}>
                <Typography variant="h6" sx={{ mb: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {label}
                </Typography>
                {typeName && (
                    <Chip
                        label={typeName || ''}
                        color="secondary"
                        size="small"
                        variant="outlined"
                        sx={{
                            mt: 0.5,
                            maxWidth: '100px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '0.75rem',
                            backgroundColor: 'rgba(0,0,0,0.2)'
                        }}
                    />
                )}
            </Box>
        </Box>
    );
};
