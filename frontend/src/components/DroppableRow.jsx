import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Box, Typography } from '@mui/material';
import { DraggableCard } from './DraggableCard';

export const DroppableRow = ({ id, cards, label, selectedCardIds, onCardClick }) => {
    const { setNodeRef, isOver } = useDroppable({ id });

    const style = {
        background: isOver ? 'rgba(0, 255, 0, 0.15)' : 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        minHeight: '140px',
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        transition: 'background-color 0.2s ease',
        overflow: 'hidden', // 【新增】: 确保内部元素不会溢出容器
    };

    return (
        <Box 
            ref={setNodeRef} 
            sx={style}
        >
            {/* 牌的容器 */}
            <Box sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                alignItems: 'center', // 垂直居中
                // 【核心修正】: 不再使用gap，而是让子元素自己处理边距
            }}>
                {cards.map((card, index) => (
                    <Box 
                        key={card.id}
                        // 【核心修正】: 对除第一张以外的牌应用负外边距来实现堆叠
                        sx={{ marginLeft: index > 0 ? '-50px' : 0 }}
                    >
                        <DraggableCard 
                            card={card} 
                            rowId={id}
                            isSelected={selectedCardIds.includes(card.id)} 
                            onClick={onCardClick}
                        />
                    </Box>
                ))}
            </Box>
            
            {/* 标签容器 */}
            <Box sx={{ width: '80px', textAlign: 'center', color: 'white', flexShrink: 0 /* 防止标签被挤压 */ }}>
                <Typography variant="h6">{label}</Typography>
            </Box>
        </Box>
    );
};
