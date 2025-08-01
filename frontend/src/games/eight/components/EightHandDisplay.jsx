import React from 'react';
import { EightPokerCard } from './EightPokerCard';
import '../../../styles/App.css';

const EightHandDisplay = ({ hand, onCardClick, selectedCard, cardWidth, cardHeight }) => {
  if (!hand || hand.length === 0) {
    return null;
  }

  const validCards = hand.filter(card => card && card.id && card.rank && card.suit);

  return (
    <div className="hand-display">
      {validCards.map((card, index) => {
        const isSelected = selectedCard && selectedCard.id === card.id;
        return (
          <EightPokerCard 
            key={card.id} 
            card={card} 
            index={index}
            isSelected={isSelected}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
            width={cardWidth}
            height={cardHeight}
          />
        );
      })}
    </div>
  );
};

export default EightHandDisplay;