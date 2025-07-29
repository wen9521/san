import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { PokerCard } from './PokerCard'; // 使用新的 PokerCard 组件

export const GameRow = ({ id, cards, label, onRowClick, selectedCardIds, onCardClick, typeName }) => {
    const CARD_WIDTH = 90;
    const CARD_HEIGHT = 126;
    const OVERLAP = 40;

    return (
        <Box 
            sx={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                minHeight: `${CARD_HEIGHT + 20}px`,
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                '&:hover': {
                    background: 'rgba(0, 255, 0, 0.15)',
                }
            }}
            onClick={() => onRowClick(id)}
        >
            <Box
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: `${CARD_WIDTH * 4.5}px`,
                    position: 'relative',
                    maxWidth: `${CARD_WIDTH * 7 - CARD_WIDTH / 2}px`,
                    overflow: 'visible',
                }}
            >
                {cards.map((card, index) => (
                    <Box 
                        key={card.id}
                        sx={{
                            marginLeft: index > 0 ? `-${OVERLAP}px` : 0,
                            zIndex: 1,
                            position: 'relative',
                            transition: 'margin-left 0.2s',
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
                {/* 右侧保留半张宽度 */}
                <Box
                    sx={{
                        width: `${CARD_WIDTH / 2}px`,
                        height: `${CARD_HEIGHT}px`,
                        flexShrink: 0,
                        opacity: 0,
                    }}
                />
            </Box>
            <Box sx={{ 
                width: '100px', 
                textAlign: 'center', 
                color: 'white', 
                flexShrink: 0, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden' 
            }}>
                <Typography variant="h6" sx={{ mb: 0, fontSize: '1.1rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '100%' }}>{label}</Typography>
                {typeName && (
                    <Chip
                        label={typeof typeName === 'string' ? typeName : ''}
                        color="secondary"
                        size="small"
                        sx={{
                            mt: 0.5,
                            maxWidth: '90px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '0.85rem'
                        }}
                    />
                )}
            </Box>
        </Box>
    );
};
