import React from 'react';

// 支持 width/height 属性，默认 90x126
export const EightPokerCard = ({ card, isSelected, onClick, width = 90, height = 126 }) => {
    // 防御性：card 或 card.id 不存在时不渲染
    if (!card || !card.id) return null;

    const style = {
        width: `${width}px`,
        height: `${height}px`,
        transform: isSelected ? 'translateY(-15px)' : 'none',
        transition: 'transform 0.2s ease-in-out',
        outline: isSelected ? '3px solid #ffab40' : 'none',
        boxShadow: isSelected ? '0 0 15px rgba(255, 171, 64, 0.8)' : '0 4px 8px rgba(0,0,0,0.3)',
        borderRadius: '8px',
        cursor: 'pointer',
        zIndex: 1, // 固定
        position: 'relative'
    };

    const handleClick = (e) => {
        e.stopPropagation();
        if (onClick && card.id) onClick(card.id);
    };

    return (
        <div 
            style={style} 
            className="poker-card"
            onClick={handleClick}
        >
            <img src={`/assets/cards/${card.id}.svg`} alt={card.id} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};
