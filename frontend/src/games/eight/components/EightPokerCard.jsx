import React from 'react';

// Standardized sizes for consistency with ThirteenPokerCard
const SIZES = {
    small: { width: 40, height: 56 },
    medium: { width: 60, height: 84 },
    large: { width: 90, height: 126 },
};

export const EightPokerCard = ({ card, isSelected, onClick, size = 'medium', isSelectable = true }) => {
    if (!card || !card.id) return null;

    const { width, height } = SIZES[size] || SIZES.medium;

    const style = {
        width: `${width}px`,
        height: `${height}px`,
        transform: isSelected ? 'translateY(-10px)' : 'none', // Slightly less jump
        transition: 'transform 0.2s ease-in-out',
        outline: isSelected ? '2px solid #ffab40' : 'none',
        boxShadow: isSelected ? '0 0 10px rgba(255, 171, 64, 0.7)' : '0 2px 4px rgba(0,0,0,0.2)',
        borderRadius: '6px', // Standard border radius
        cursor: isSelectable ? 'pointer' : 'default',
        position: 'relative',
    };

    const handleClick = (e) => {
        if (!isSelectable || !onClick) return;
        e.stopPropagation();
        onClick(card.id);
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