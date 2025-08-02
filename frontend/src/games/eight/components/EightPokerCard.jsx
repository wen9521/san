import React from 'react';

// Using the exact styling from ThirteenPokerCard for perfect consistency.
export const EightPokerCard = ({ card, isSelected, onClick, width = 90, height = 126, isSelectable = true }) => {
    if (!card || !card.id) return null;

    const style = {
        width: `${width}px`,
        height: `${height}px`,
        transform: isSelected ? 'translateY(-15px)' : 'none',
        transition: 'transform 0.2s ease-in-out',
        outline: isSelected ? '3px solid #ffab40' : 'none',
        boxShadow: isSelected ? '0 0 15px rgba(255, 171, 64, 0.8)' : '0 4px 8px rgba(0,0,0,0.3)',
        borderRadius: '8px',
        cursor: isSelectable ? 'pointer' : 'default',
        zIndex: isSelected ? 2 : 1, // Ensure selected card is on top
        position: 'relative'
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
