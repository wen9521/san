import React, { useState, useRef, useLayoutEffect } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { PokerCard } from './PokerCard';

export const GameRow = ({ id, cards, label, onRowClick, selectedCardIds, onCardClick, typeName }) => {
    const CARD_WIDTH = 80;
    const CARD_HEIGHT = 112;
    const SELECTED_LIFT = 20; // 定义一个常量表示选中时向上移动的距离
    const containerRef = useRef(null);
    const [overlap, setOverlap] = useState(40);

    useLayoutEffect(() => {
        const calculateOverlap = () => {
            if (!containerRef.current) return;

            const containerWidth = containerRef.current.offsetWidth;
            const numCards = cards.length;
            const reservedSpace = CARD_WIDTH / 1.5;
            const availableWidth = containerWidth - reservedSpace;

            if (numCards <= 1) {
                setOverlap(0);
                return;
            }
            
            const totalCardsWidth = numCards * CARD_WIDTH;

            if (totalCardsWidth <= availableWidth) {
                setOverlap(5);
            } else {
                const requiredOverlap = (totalCardsWidth - availableWidth) / (numCards - 1);
                setOverlap(Math.max(20, requiredOverlap));
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
                minHeight: `${CARD_HEIGHT + 20 + SELECTED_LIFT}px`, // 增加高度以容纳弹出的牌
                display: 'flex',
                alignItems: 'center',
                padding: `10px 15px`,
                paddingTop: `${SELECTED_LIFT + 10}px`, // 增加顶部内边距
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                    background: 'rgba(0, 255, 0, 0.15)',
                },
                position: 'relative',
                // overflow: 'hidden' // 移除此行以允许牌向上溢出
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
                {cards.map((card, index) => {
                    const isSelected = selectedCardIds?.includes(card.id);
                    return (
                        <Box 
                            key={card.id}
                            sx={{
                                position: 'absolute',
                                left: `${index * (CARD_WIDTH - overlap)}px`,
                                zIndex: isSelected ? 1000 : 10 + index, // 大幅提高选中牌的 z-index
                                transition: 'left 0.3s ease, transform 0.2s ease, z-index 0s',
                                transform: isSelected ? `translateY(-${SELECTED_LIFT}px)` : 'none',
                            }}
                        >
                            <PokerCard 
                                card={card} 
                                isSelected={isSelected} 
                                onClick={onCardClick}
                                width={CARD_WIDTH}
                                height={CARD_HEIGHT}
                            />
                        </Box>
                    );
                })}
            </Box>

            {/* Label on the right */}
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
                zIndex: 1, // 确保标签在牌的下方
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
