import React from 'react';

export const EightPokerCard = ({ card, isSelected, onClick, isSelectable = true }) => {
    if (!card || !card.id) return null;

    const wrapperStyle = {
        width: '100%',
        paddingTop: '140%', // Aspect ratio for poker cards (height is 1.4 * width)
        position: 'relative',
        transform: isSelected ? 'translateY(-15px)' : 'none',
        transition: 'transform 0.2s ease-in-out',
        cursor: isSelectable ? 'pointer' : 'default',
        zIndex: isSelected ? 10 : 1,
        filter: isSelected ? 'drop-shadow(0 0 8px #ffab40)' : 'none',
    };
    
    const imageStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
    };

    const handleClick = (e) => {
        if (!isSelectable || !onClick) return;
        e.stopPropagation();
        onClick(card.id);
    };

    return (
        <div
            style={wrapperStyle}
            className="poker-card-wrapper"
            onClick={handleClick}
        >
            <img src={`/assets/cards/${card.id}.svg`} alt={card.id} style={imageStyle} />
        </div>
    );
};
