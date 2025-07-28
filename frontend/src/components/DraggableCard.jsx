import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function DraggableCard({ card, isSelected, onClick }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 'auto',
        outline: isSelected ? '3px solid #ffab40' : 'none',
        boxShadow: isSelected ? '0 0 15px #ffab40' : '0 4px 8px rgba(0,0,0,0.3)',
        borderRadius: '8px',
    };
    
    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners} 
            className="poker-card"
            onClick={onClick}
        >
            <img src={`/assets/cards/${card.id}.svg`} alt={card.displayName} />
        </div>
    );
}