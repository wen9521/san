import React from 'react';
import { PokerCard } from './PokerCard';
import '../../../styles/App.css';

// 【已修复】确保所有父组件都传入 onCardClick 函数
const HandDisplay = ({ hand, onCardClick, selectedCard }) => {
  if (!hand || hand.length === 0) {
    return null;
  }

  // 修正：过滤掉无效的卡牌数据
  const validCards = hand.filter(card => card && card.id && card.rank);

  return (
    <div className="hand-display">
      {validCards.map((card, index) => {
        // 检查这张牌是否被选中
        const isSelected = selectedCard && selectedCard.id === card.id;
        return (
          <PokerCard 
            key={card.id} 
            card={card} 
            index={index}
            isSelected={isSelected}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
          />
        );
      })}
    </div>
  );
};

export default HandDisplay;