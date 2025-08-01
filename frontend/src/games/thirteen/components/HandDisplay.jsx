import React from 'react';
import { PokerCard } from './PokerCard';
import '../../../styles/App.css';

const HandDisplay = ({ hand, onCardClick, selectedCardIds }) => {
    if (!hand || hand.length === 0) {
        return null;
    }
    const validCards = hand.filter(card => card && card.id);

    return (
        <div className="hand-display">
            {validCards.map((card, index) => {
                const isSelected = selectedCardIds && selectedCardIds.includes(card.id);
                return (
                    <PokerCard
                        key={card.id}
                        card={card}
                        index={index}
                        isSelected={isSelected}
                        onClick={onCardClick ? () => onCardClick(card.id) : undefined}
                    />
                );
            })}
        </div>
    );
};

export default HandDisplay;