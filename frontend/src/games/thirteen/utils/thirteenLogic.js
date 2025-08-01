// Placeholder for thirteen card game logic
export const sortThirteenGameCardsByRank = (cards) => cards || [];
export const checkForThirteenGameSpecialHand = (hand) => null;
export const getAIThirteenGameBestArrangement = (hand) => ({ front: [], middle: [], back: [] });
export const calculateThirteenGameTotalScore = (rowsA, rowsB) => ({ playerAScore: 0, playerBScore: 0 });
export const validateArrangement = () => ({ isValid: true, message: '' });
export const evaluateThirteenGameHand = (hand) => ({ name: '乌龙', value: 0 });

export const getHandTypeName = (evaluation) => {
    if (!evaluation) return '';
    return evaluation.name;
};
