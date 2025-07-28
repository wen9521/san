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

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : (isSelected ? 10 : 'auto'),
        outline: isSelected ? '3px solid #ffab40' : 'none',
        boxShadow: isSelected ? '0 0 15px rgba(255, 171, 64, 0.8)' : '0 4px 8px rgba(0,0,0,0.3)',
        borderRadius: '8px',
        transform: isSelected && !isDragging ? `translateY(-10px) ${CSS.Transform.toString(transform) || ''}` : CSS.Transform.toString(transform),
        // 【核心修正】: 确保 touch-action 应用于整个可拖拽元素
        touchAction: 'none',
    };
    
    return (
        // 【核心修正】: 将 listeners, attributes 直接应用到最外层的 div
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
