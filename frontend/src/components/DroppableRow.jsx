import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Typography } from '@mui/material';
import { DraggableCard } from './DraggableCard';
import '../styles/App.css';

export function DroppableRow({ id, label, cards, selectedCardIds, onCardClick }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <SortableContext id={id} items={cards.map(c => c.id)} strategy={horizontalListSortingStrategy}>
            <Box ref={setNodeRef} className="game-row-new">
                <Box className="card-container">
                    {cards.map(card => (
                        <DraggableCard
                            key={card.id}
                            card={card}
                            isSelected={selectedCardIds.includes(card.id)}
                            onClick={(e) => onCardClick(card.id, id, e)} // 传递事件对象e
                        />
                    ))}
                </Box>
                <Typography className="row-label">{label}</Typography>
            </Box>
        </SortableContext>
    );
}
