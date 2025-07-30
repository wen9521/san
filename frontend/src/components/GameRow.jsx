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
            const reservedSpace = CARD_WIDTH / 2;
            const availableWidth = containerWidth - reservedSpace;

            if (numCards <= 1) {
                setOverlap(0);
                return;
            }

            const totalCardsWidth = numCards * CARD_WIDTH;

            if (totalCardsWidth <= availableWidth) {
                setOverlap(5); //
            } else {
                const requiredOverlap = (totalCardsWidth - availableWidth) / (numCards - 1);
                setOverlap(Math.max(10, requiredOverlap));
            }
        };

        calculateOverlap();

        const resizeObserver = new ResizeObserver(calculateOverlap);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
        };
    }, [cards.length, CARD_WIDTH]);

    return (
        <Box 
            sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                minHeight: `${CARD_HEIGHT + 20}px`,
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                    background: 'rgba(0, 255, 0, 0.15)',
                }
            }}
            onClick={() => onRowClick(id)}
        >
            {/* Label on the left */}
            <Box sx={{ 
                width: '110px',
                textAlign: 'center', 
                color: 'white', 
                flexShrink: 0, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                mr: 1, // Margin right
                overflow: 'hidden'
            }}>
                <Typography variant="h6" sx={{ mb: 0, fontSize: '1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%' }}>
                    {label}
                </Typography>
                {typeName && (
                    <Chip
                        label={typeName || ''}
                        color="secondary"
                        size="small"
                        sx={{
                            mt: 0.5,
                            maxWidth: '100px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '0.75rem'
                        }}
                    />
                )}
            </Box>

            {/* Cards container */}
            <Box
                ref={containerRef}
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative',
                    height: `${CARD_HEIGHT}px`,
                    overflow: 'hidden', // Prevents cards from visually overflowing during calculation
                }}
            >
                {cards.map((card, index) => (
                    <Box 
                        key={card.id}
                        sx={{
                            position: 'absolute',
                            left: `${index * (CARD_WIDTH - overlap)}px`,
                            zIndex: selectedCardIds?.includes(card.id) ? 100 + index : 1 + index,
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
        </Box>
    );
};
