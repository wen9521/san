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
        id: card.id // 【核心修正】: 确保这里的id是唯一的字符串或数字
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : (isSelected ? 10 : 'auto'),
        outline: isSelected ? '3px solid #ffab40' : 'none',
        boxShadow: isSelected ? '0 0 15px rgba(255, 171, 64, 0.8)' : '0 4px 8px rgba(0,0,0,0.3)',
        borderRadius: '8px',
        // 当被选中时，稍微上移，提供更好的视觉反馈
        transform: isSelected && !isDragging ? `translateY(-10px) ${CSS.Transform.toString(transform) || ''}` : CSS.Transform.toString(transform),
    };
    
    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className="poker-card"
            onClick={onClick}
        >
            <div {...attributes} {...listeners} style={{touchAction: 'none'}}> {/* 将拖拽监听器放在一个内部div上 */}
                 <img src={`/assets/cards/${card.id}.svg`} alt={card.displayName} />
            </div>
        </div>
    );
}
