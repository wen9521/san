// frontend/src/games/eight/components/EightCompactHandDisplay.jsx
import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { EightPokerCard } from './EightPokerCard';
import { getHandTypeName, evaluateEightGameHand } from '../utils/eightLogic';

// This component is specifically for the comparison screen to show a player's hand compactly.
const CompactCardRow = ({ cards }) => {
    if (!cards || cards.length === 0) return <Box sx={{ height: '42px' }} />; // Placeholder for empty row

    return (
        <Box sx={{ display: 'flex', position: 'relative', width: `${cards.length * 15 + 25}px`, height: '42px', margin: 'auto' }}>
            {cards.map((card, index) => (
                <Box
                    key={card.id}
                    sx={{
                        position: 'absolute',
                        left: `${index * 15}px`, // Tightly stacked
                        zIndex: index
                    }}
                >
                    <EightPokerCard card={card} width={40} height={56} isSelectable={false} />
                </Box>
            ))}
        </Box>
    );
};

const EightCompactHandDisplay = ({ player, details }) => {
    if (!player) return null;

    const getPointColor = (points) => {
        if (points > 0) return 'success.light';
        if (points < 0) return 'error.light';
        return 'text.secondary';
    };
    
    const totalScore = details ? details.front.points + details.middle.points + details.back.points : 0;
    
    return (
        <Paper elevation={3} sx={{ p: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)', color: 'white', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{player.name}</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: getPointColor(totalScore) }}>
                    {totalScore > 0 ? `+${totalScore}` : totalScore}
                </Typography>
            </Stack>
            
            <Stack sx={{ mt: 1 }} spacing={0.5}>
                {['back', 'middle', 'front'].map(area => {
                    const handEval = details ? evaluateEightGameHand(player.rows[area]) : null;
                    const areaPoints = details ? details[area].points : 0;
                    return (
                        <Box key={area} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{flex: 1}}>
                                <CompactCardRow cards={player.rows[area]} />
                            </Box>
                            <Typography sx={{ fontSize: '0.7rem', color: 'lightgray', minWidth: '45px', textAlign: 'center' }}>
                                {getHandTypeName(handEval)}
                            </Typography>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: getPointColor(areaPoints), minWidth: '30px', textAlign: 'right' }}>
                                {areaPoints > 0 ? `+${areaPoints}` : areaPoints}
                            </Typography>
                        </Box>
                    );
                })}
            </Stack>
        </Paper>
    );
};

export default EightCompactHandDisplay;