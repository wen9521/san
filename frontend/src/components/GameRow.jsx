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

    // 八张/十三张自适应宽度，head 2/3, middle/back 3/5
    // 这里简单判断下 label 或 cards.length
    let cardWidth = 90, cardHeight = 126;
    if (cards.length <= 3 || /八张|2|头道/.test(label)) {
        cardWidth = 60;
        cardHeight = 84;
    }

    return (
        <Box 
            sx={style}
            onClick={() => onRowClick(id)}
        >
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                {cards.map((card, index) => (
                    <Box 
                        key={card.id}
                        sx={{ marginLeft: index > 0 ? '-40px' : 0 }}
                    >
                        <PokerCard 
                            card={card} 
                            isSelected={selectedCardIds.includes(card.id)} 
                            onClick={onCardClick}
                            width={cardWidth}
                            height={cardHeight}
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
