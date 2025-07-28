import React from 'react';
import PokerCard from './PokerCard';
import '../styles/App.css';

// hand 结构: [{ id: '...', displayName: '...' }, ...]
const HandDisplay = ({ hand }) => {
  if (!hand || hand.length === 0) {
    return null; // 如果没有手牌，不渲染任何东西
  }

  return (
    <div className="hand-display">
      {hand.map((card, index) => (
        <PokerCard key={card.id} cardData={card} index={index} />
      ))}
    </div>
  );
};

export default HandDisplay;