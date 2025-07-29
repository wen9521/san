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
    } = useSortable({ 
        id: card.id
    });

    const dynamicTransform = CSS.Transform.toString(transform);

    const style = {
        // 【核心修正】: 合并 transform 逻辑，避免重复键
        transform: isSelected && !isDragging 
                   ? `translateY(-10px) ${dynamicTransform || ''}` 
                   : dynamicTransform,
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : (isSelected ? 10 : 'auto'),
        outline: isSelected ? '3px solid #ffab40' : 'none',
        boxShadow: isSelected ? '0 0 15px rgba(255, 171, 64, 0.8)' : '0 4px 8px rgba(0,0,0,0.3)',
        borderRadius: '8px',
        touchAction: 'none',
    };
    
    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className="poker-card"
            onClick={onClick}
            {...attributes}
            {...listeners}
        >
            <img src={`/assets/cards/${card.id}.svg`} alt={card.displayName} />
        </div>
    );
}
