import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';
import { DraggableCard } from './DraggableCard';

export const DroppableRow = ({ id, cards, label, selectedCardIds, onCardClick }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    const style = {
        background: isOver ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        minHeight: '140px', // 确保有足够的高度
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        transition: 'background-color 0.2s ease',
    };

    return (
        <Box 
            ref={setNodeRef} 
            sx={style}
        >
            {/* 牌的容器 */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexWrap: 'nowrap', gap: '-40px' /* 卡片重叠效果 */ }}>
                {cards.map((card, index) => (
                    <DraggableCard 
                        key={card.id} 
                        card={card} 
                        rowId={id}
                        isSelected={selectedCardIds.includes(card.id)} 
                        onClick={onCardClick}
                    />
                ))}
            </Box>
            
            {/* 标签容器 */}
            <Box sx={{ width: '80px', textAlign: 'center', color: 'white' }}>
                <Typography variant="h6">{label}</Typography>
            </Box>
        </Box>
    );
};
