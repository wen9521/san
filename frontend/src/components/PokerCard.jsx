import React from 'react';
import '../styles/App.css';

// cardData 结构: { id: 'king_of_spades', displayName: '黑桃K' }
// index: 卡牌在手牌中的索引，用于动画
const PokerCard = ({ cardData, index }) => {
  // 根据id构建图片路径
  // 图片必须放在 public/assets/cards/ 目录下
  const imageUrl = `/assets/cards/${cardData.id}.svg`;

  // 计算动画延迟和旋转角度，形成扇形展开效果
  const totalCards = 13;
  const middleCardIndex = Math.floor(totalCards / 2);
  const rotationAngle = (index - middleCardIndex) * 5; // 每张牌偏转5度
  const animationDelay = `${index * 0.08}s`; // 每张牌延迟80毫秒发牌

  const cardStyle = {
    '--rotation': `${rotationAngle}deg`,
    '--delay': animationDelay,
    zIndex: index, // 保证牌的堆叠顺序正确
  };

  return (
    <div className="poker-card poker-card-enter" style={cardStyle} title={cardData.displayName}>
      <img src={imageUrl} alt={cardData.displayName} />
    </div>
  );
};

export default PokerCard;