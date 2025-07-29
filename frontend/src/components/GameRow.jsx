import React from 'react';
import { Box, Typography } from '@mui/material';
import { PokerCard } from './PokerCard'; // 使用新的 PokerCard 组件

export const GameRow = ({ id, cards, label, onRowClick, selectedCardIds, onCardClick }) => {
    const style = {
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        minHeight: '140px',
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        '&:hover': {
            background: 'rgba(0, 255, 0, 0.15)',
        }
    };

    return (
        <Box 
            sx={style}
            onClick={() => onRowClick(id)}
        >
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                {cards.map((card, index) => (
                    <Box 
                        key={card.id}
                        sx={{ marginLeft: index > 0 ? '-50px' : 0 }}
                    >
                        <PokerCard 
                            card={card} 
                            isSelected={selectedCardIds.includes(card.id)} 
                            onClick={onCardClick}
                        />
                    </Box>
                ))}
            </Box>
            
            <Box sx={{ width: '80px', textAlign: 'center', color: 'white', flexShrink: 0 }}>
                <Typography variant="h6">{label}</Typography>
            </Box>
        </Box>
    );
};
