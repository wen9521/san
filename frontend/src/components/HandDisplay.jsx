import React from 'react';
import { PokerCard } from './PokerCard'; // Assuming PokerCard is in the same directory
import '../styles/App.css';

// 【已修复】确保所有父组件都传入 onCardClick 函数
const HandDisplay = ({ hand, onCardClick, selectedCard }) => {
  if (!hand || hand.length === 0) {
    return null;
  }

  // 确保过滤掉无效的卡牌数据
  const validCards = hand.filter(card => card && card.id);

  return (
    <div className="hand-display">
      {validCards.map((card, index) => {
        // 检查这张牌是否被选中
        const isSelected = selectedCard && selectedCard.id === card.id;
        return (
          <PokerCard 
            key={card.id} 
            // 【核心修复】将属性名从 cardData 改为 card
            card={card} 
            index={index}
            isSelected={isSelected}
            // 传递从父组件接收的点击事件处理器
            onClick={onCardClick ? () => onCardClick(card) : undefined}
          />
        );
      })}
    </div>
  );
};

export default HandDisplay;
