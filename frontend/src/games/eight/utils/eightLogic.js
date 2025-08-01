/**
 * =================================================================================
 * 八张游戏核心逻辑 (8-Card Poker Logic) - V8 (Ultra-Robust AI Fallback)
 * =================================================================================
 */

export const EIGHT_GAME_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const EIGHT_GAME_SUITS = { 'S': 4, 'H': 3, 'C': 2, 'D': 1 };
export const EIGHT_GAME_HAND_TYPES = { STRAIGHT_FLUSH: 4, THREE_OF_A_KIND: 3, STRAIGHT: 2, PAIR: 1, HIGH_CARD: 0 };
export const EIGHT_GAME_SPECIAL_HAND_TYPES = { FOUR_OF_A_KIND: { score: 8, name: '四条' }, FOUR_PAIRS: { score: 8, name: '四对' } };

const getRankValue = (card) => EIGHT_GAME_RANKS.indexOf(card.rank);
const getSuitValue = (card) => EIGHT_GAME_SUITS[card.suit.toUpperCase()];

export const sortEightGameCardsByRank = (cards) => {
    if (!cards || !Array.isArray(cards)) return [];
    return [...cards].sort((a, b) => {
        if (!a || !b) return 0;
        return getRankValue(b) - getRankValue(a);
    });
};

export const getHandTypeName = (evaluation) => {
    if (!evaluation || typeof evaluation.type === 'undefined') return '未知';
    const typeMap = {
        [EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH]: '同花顺',
        [EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND]: '三条',
        [EIGHT_GAME_HAND_TYPES.STRAIGHT]: '顺子',
        [EIGHT_GAME_HAND_TYPES.PAIR]: '对子',
        [EIGHT_GAME_HAND_TYPES.HIGH_CARD]: '高牌'
    };
    return typeMap[evaluation.type] || '未知';
};


export const evaluateEightGameHand = (hand) => {
    if (!hand || hand.length === 0) return { type: EIGHT_GAME_HAND_TYPES.HIGH_CARD, highCards: [], hand: [] };
    const sortedHand = sortEightGameCardsByRank(hand);
    const ranks = sortedHand.map(c => getRankValue(c));
    const suits = sortedHand.map(c => c.suit);
    let highCards = ranks;
    const maxSuit = getSuitValue(sortedHand[0]);
    const rankCounts = ranks.reduce((acc, rank) => { acc[rank] = (acc[rank] || 0) + 1; return acc; }, {});
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const isFlush = new Set(suits).size === 1;
    const isWheel = JSON.stringify(ranks) === JSON.stringify([12, 2, 1]);
    const isNormalStraight = new Set(ranks).size === ranks.length && ranks[0] - ranks[ranks.length - 1] === ranks.length - 1;
    const isStraight = isNormalStraight || (hand.length === 3 && isWheel);
    if (isWheel) highCards = [2, 1, 12];
    if (isStraight && isFlush) return { type: EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH, highCards, hand, maxSuit };
    if (counts[0] === 3) return { type: EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND, highCards, hand, maxSuit };
    if (isStraight) return { type: EIGHT_GAME_HAND_TYPES.STRAIGHT, highCards, hand, maxSuit };
    if (counts[0] === 2) return { type: EIGHT_GAME_HAND_TYPES.PAIR, highCards, hand, maxSuit };
    return { type: EIGHT_GAME_HAND_TYPES.HIGH_CARD, highCards, hand, maxSuit };
};

export const compareEightGameHands = (handA, handB) => {
    if (handA.type !== handB.type) return handA.type - handB.type;
    for (let i = 0; i < handA.highCards.length; i++) {
        if (handA.highCards[i] !== handB.highCards[i]) return handA.highCards[i] - handB.highCards[i];
    }
    return handA.maxSuit - handB.maxSuit;
};

export const validateEightGameArrangement = (rows) => {
    if (!rows || !rows.front || !rows.middle || !rows.back || rows.front.length !== 2 || rows.middle.length !== 3 || rows.back.length !== 3) return { isValid: false };
    const frontHand = evaluateEightGameHand(rows.front);
    const middleHand = evaluateEightGameHand(rows.middle);
    const backHand = evaluateEightGameHand(rows.back);
    if (compareEightGameHands(frontHand, middleHand) > 0 || compareEightGameHands(middleHand, backHand) > 0) return { isValid: false };
    return { isValid: true };
};

const getHandScore = (winningHand, area) => {
    if (area === 'front') return winningHand.type === EIGHT_GAME_HAND_TYPES.PAIR ? winningHand.highCards[0] + 2 : 1;
    const scores = { [EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH]: 10, [EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND]: 6, [EIGHT_GAME_HAND_TYPES.STRAIGHT]: 4 };
    return scores[winningHand.type] || 1;
};

export const calculateEightGameTotalScore = (playerARows, playerBRows) => {
    let playerAScore = 0;
    const details = ['front', 'middle', 'back'].map(area => {
        const handA = evaluateEightGameHand(playerARows[area]);
        const handB = evaluateEightGameHand(playerBRows[area]);
        const comparison = compareEightGameHands(handA, handB);
        const areaScore = comparison !== 0 ? getHandScore(comparison > 0 ? handA : handB, area) : 0;
        playerAScore += comparison > 0 ? areaScore : -areaScore;
        return { area, winner: comparison > 0 ? 'A' : (comparison < 0 ? 'B' : 'Tie'), score: areaScore };
    });
    const aWins = details.filter(d => d.winner === 'A').length;
    if (aWins === 3 || (aWins === 0 && details.filter(d => d.winner === 'B').length === 3)) playerAScore *= 2;
    return { playerAScore, playerBScore: -playerAScore, details };
};

export const checkForEightGameSpecialHand = (fullHand) => {
    if (!fullHand || fullHand.length !== 8) return null;
    const ranks = fullHand.map(c => getRankValue(c));
    const rankCounts = ranks.reduce((acc, rank) => { acc[rank] = (acc[rank] || 0) + 1; return acc; }, {});
    const counts = Object.values(rankCounts);
    if (counts.includes(4)) return EIGHT_GAME_SPECIAL_HAND_TYPES.FOUR_OF_A_KIND;
    if (counts.length === 4 && counts.every(c => c === 2)) return EIGHT_GAME_SPECIAL_HAND_TYPES.FOUR_PAIRS;
    return null;
};

const combinations = (array, k) => {
    const result = [];
    function f(p, a, n) { if (n === 0) { result.push(p); return; } for (let i = 0; i < a.length; i++) f(p.concat(a[i]), a.slice(i + 1), n - 1); }
    f([], array, k);
    return result;
};

export const getAIEightGameBestArrangement = (fullHand) => {
    if (!fullHand || fullHand.length !== 8) return { front: [], middle: [], back: [] };
    const allFrontHands = combinations(fullHand, 2);
    for (const currentFront of allFrontHands) {
        const remaining6 = fullHand.filter(card => !currentFront.some(fc => fc.id === card.id));
        const allMiddleHands = combinations(remaining6, 3);
        for (const currentMiddle of allMiddleHands) {
            const currentBack = remaining6.filter(card => !currentMiddle.some(mc => mc.id === card.id));
            if (validateEightGameArrangement({ front: currentFront, middle: currentMiddle, back: currentBack }).isValid) {
                return { front: currentFront, middle: currentMiddle, back: currentBack };
            }
        }
    }
    
    //【已修复】提供一个绝对安全的后备方案
    console.warn("AI Warning: No valid 8-card arrangement found. Providing default sorted layout.");
    const sortedHand = sortEightGameCardsByRank(fullHand);
    return {
        front: sortedHand.slice(6, 8),
        middle: sortedHand.slice(3, 6),
        back: sortedHand.slice(0, 3)
    };
};
