import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { PokerCard } from './PokerCard'; // Corrected import
import '../styles/App.css';

const Row = ({ name, cards, onRowClick, typeName, onCardReturn }) => (
  <Box className="game-row" onClick={() => onRowClick(cards)}>
    <Typography variant="h6" color="secondary" align="left" gutterBottom>
      {name} {typeName && <Chip label={typeName} color="primary" size="small" sx={{ ml: 1 }} />}
    </Typography>
    <Box className="game-row-content">
      {cards.length > 0 ? (
        cards.filter(card => card && card.id).map((card, i) => (
          <PokerCard 
            key={card.id} 
            // 【核心修复】确保属性名为 card
            card={card} 
            index={i}
            onClick={(e) => {
              e.stopPropagation();
              if (onCardReturn) onCardReturn(card);
            }}
          />
        ))
      ) : (
        <Typography variant="body2" color="text.disabled">点击此处放置选中的牌</Typography>
      )}
    </Box>
  </Box>
);

const GameRows = ({ rows, onRowClick, validationResult, onCardReturn }) => {
    const details = validationResult?.details || {};
    return (
        <Box className="game-rows-container">
            <Row name="后道 (5张)" cards={rows.back} onRowClick={() => onRowClick('back')} typeName={details.back} onCardReturn={(card) => onCardReturn(card, 'back')} />
            <Row name="中道 (5张)" cards={rows.middle} onRowClick={() => onRowClick('middle')} typeName={details.middle} onCardReturn={(card) => onCardReturn(card, 'middle')} />
            <Row name="前道 (3张)" cards={rows.front} onRowClick={() => onRowClick('front')} typeName={details.front} onCardReturn={(card) => onCardReturn(card, 'front')} />
        </Box>
    );
};

export default GameRows;
