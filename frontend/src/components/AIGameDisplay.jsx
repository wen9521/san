import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import PokerCard from './PokerCard';
import '../styles/App.css'; // 复用现有样式

// 单行组件，带输赢结果
const AIResultRow = ({ name, cards, typeName, result }) => {
    let resultColor = 'default';
    let resultText = '';
    if (result === 'win') {
        resultColor = 'success';
        resultText = '胜';
    } else if (result === 'loss') {
        resultColor = 'error';
        resultText = '负';
    } else if (result === 'tie') {
        resultColor = 'warning';
        resultText = '平';
    }

    return (
        <Box className="game-row" sx={{ borderColor: result !== null ? resultColor + '.main' : 'rgba(255, 255, 255, 0.3)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" color="secondary" align="left">
                    {name} {typeName && <Chip label={typeName} color="secondary" size="small" sx={{ ml: 1 }} />}
                </Typography>
                {resultText && <Chip label={resultText} color={resultColor} sx={{ fontWeight: 'bold' }} />}
            </Box>
            <Box className="game-row-content" sx={{ mt: 1 }}>
                {cards.map((card, i) => (
                    <PokerCard key={card.id} cardData={card} index={i} />
                ))}
            </Box>
        </Box>
    );
}

// AI牌局主组件
const AIGameDisplay = ({ aiRows, comparisonResult }) => {
    if (!aiRows) return null;

    const details = comparisonResult?.details?.ai || {};
    const results = comparisonResult?.results || {};

    return (
        <Box className="game-rows-container">
            <Typography variant="h5" color="primary.main" gutterBottom>电脑(AI)牌型</Typography>
            <AIResultRow name="后道" cards={aiRows.back} typeName={details.back?.name} result={results.back} />
            <AIResultRow name="中道" cards={aiRows.middle} typeName={details.middle?.name} result={results.middle} />
            <AIResultRow name="前道" cards={aiRows.front} typeName={details.front?.name} result={results.front} />
        </Box>
    );
};

export default AIGameDisplay;