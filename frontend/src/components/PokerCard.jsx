import React from 'react';
import '../styles/App.css';

const PokerCard = ({ cardData, index, isSelected, onClick }) => {
  const imageUrl = `/assets/cards/${cardData.id}.svg`;
  const totalCards = 13;
  const middleCardIndex = Math.floor(totalCards / 2);
  const rotationAngle = (index - middleCardIndex) * 4; // 减小角度，更紧凑
  const animationDelay = `${index * 0.08}s`;

  const cardStyle = {
    '--rotation': `${rotationAngle}deg`,
    '--delay': animationDelay,
    zIndex: index,
  };

  const className = `poker-card ${isSelected ? 'selected' : ''}`;
  
  return (
    <div className={className} style={cardStyle} title={cardData.displayName} onClick={onClick}>
      <img src={imageUrl} alt={cardData.displayName} />
    </div>
  );
};

export default PokerCard;