import React from 'react';

export const PokerCard = ({ card, isSelected, onClick }) => {
    const style = {
        transform: isSelected ? 'translateY(-15px)' : 'none',
        transition: 'transform 0.2s ease-in-out',
        outline: isSelected ? '3px solid #ffab40' : 'none',
        boxShadow: isSelected ? '0 0 15px rgba(255, 171, 64, 0.8)' : '0 4px 8px rgba(0,0,0,0.3)',
        borderRadius: '8px',
        cursor: 'pointer',
    };

    return (
        <div 
            style={style} 
            className="poker-card"
            onClick={() => onClick(card.id)}
        >
            <img src={`/assets/cards/${card.id}.svg`} alt={card.id} style={{ width: '100%', height: '100%' }} />
        </div>
    );
};
