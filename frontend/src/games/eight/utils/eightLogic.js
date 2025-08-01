export const EIGHT_GAME_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const EIGHT_GAME_SUITS = { 'S': 4, 'H': 3, 'C': 2, 'D': 1 };
export const EIGHT_GAME_HAND_TYPES = { STRAIGHT_FLUSH: 5, THREE_OF_A_KIND: 4, STRAIGHT: 3, PAIR: 2, HIGH_CARD: 1 };
export const EIGHT_GAME_SPECIAL_HAND_TYPES = { FOUR_OF_A_KIND: { score: 8, name: '四条' }, FOUR_PAIRS: { score: 8, name: '四对' } };

const getRankValue = (card) => card && typeof card.rank === 'string' ? EIGHT_GAME_RANKS.indexOf(card.rank) : -1;
const getSuitValue = (card) => card && card.suit ? EIGHT_GAME_SUITS[card.suit?.toUpperCase?.()] : -1;

export const sortEightGameCardsByRank = (cards) => {
    if (!Array.isArray(cards)) return [];
    // 关键修复：在排序前彻底过滤掉所有无效或不完整的卡牌对象
    return cards
        .filter(card => card && typeof card.rank === 'string' && typeof card.suit === 'string')
        .sort((a, b) => {
            const rankA = EIGHT_GAME_RANKS.indexOf(a.rank);
            const rankB = EIGHT_GAME_RANKS.indexOf(b.rank);
            return rankB - rankA;
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
    // 彻底过滤无效牌
    if (!Array.isArray(hand) || hand.length === 0) return { type: EIGHT_GAME_HAND_TYPES.HIGH_CARD, highCards: [], hand: [] };
    const validHand = hand.filter(card => card && typeof card.rank === 'string' && typeof card.suit === 'string');
    if (validHand.length === 0) return { type: EIGHT_GAME_HAND_TYPES.HIGH_CARD, highCards: [], hand: [] };

    const sortedHand = sortEightGameCardsByRank(validHand);
    const ranks = sortedHand.map(c => getRankValue(c));
    const suits = sortedHand.map(c => c.suit);
    let highCards = ranks;
    const maxSuit = getSuitValue(sortedHand[0]);
    const rankCounts = ranks.reduce((acc, rank) => { acc[rank] = (acc[rank] || 0) + 1; return acc; }, {});
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const isFlush = new Set(suits).size === 1;
    const isWheel = validHand.length === 3 && JSON.stringify(ranks) === JSON.stringify([12, 1, 0]);
    const isNormalStraight = validHand.length === 3 && new Set(ranks).size === 3 && ranks[0] - ranks[2] === 2;
    const isStraight = isNormalStraight || isWheel;

    let straightRank = 0;
    if (isStraight) {
        if (ranks[0] === 12 && ranks[1] === 11) straightRank = 13;
        else if (isWheel) straightRank = 12;
        else straightRank = ranks[0];
    }
    if (isStraight && isFlush) return { type: EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH, highCards, hand: validHand, maxSuit, straightRank };
    if (counts[0] === 3) return { type: EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND, highCards, hand: validHand, maxSuit };
    if (isStraight) return { type: EIGHT_GAME_HAND_TYPES.STRAIGHT, highCards, hand: validHand, maxSuit, straightRank };
    if (counts[0] === 2) return { type: EIGHT_GAME_HAND_TYPES.PAIR, highCards, hand: validHand, maxSuit };
    return { type: EIGHT_GAME_HAND_TYPES.HIGH_CARD, highCards, hand: validHand, maxSuit };
};

export const compareEightGameHands = (handA, handB) => {
    if (!handA || !handB) return 0;
    if (handA.type !== handB.type) return handA.type - handB.type;
    if (handA.type === EIGHT_GAME_HAND_TYPES.STRAIGHT || handA.type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH) {
        if (handA.straightRank !== handB.straightRank) {
            return handA.straightRank - handB.straightRank;
        }
    }
    for (let i = 0; i < handA.highCards.length; i++) {
        if (handA.highCards[i] !== handB.highCards[i]) return handA.highCards[i] - handB.highCards[i];
    }
    return handA.maxSuit - handB.maxSuit;
};

export const validateEightGameArrangement = (rows) => {
    if (!rows || !rows.front || !rows.middle || !rows.back || rows.front.length !== 2 || rows.middle.length !== 3 || rows.back.length !== 3) return { isValid: false, message: '牌墩数量不正确' };
    const frontHand = evaluateEightGameHand(rows.front);
    const middleHand = evaluateEightGameHand(rows.middle);
    const backHand = evaluateEightGameHand(rows.back);
    if (compareEightGameHands(frontHand, middleHand) > 0) return { isValid: false, message: '头道大于中道' };
    if (compareEightGameHands(middleHand, backHand) > 0) return { isValid: false, message: '中道大于尾道' };
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
    if (!Array.isArray(fullHand) || fullHand.length !== 8) return null;
    const validHand = fullHand.filter(card => card && typeof card.rank === 'string' && typeof card.suit === 'string');
    const ranks = validHand.map(c => getRankValue(c));
    const rankCounts = ranks.reduce((acc, rank) => { acc[rank] = (acc[rank] || 0) + 1; return acc; }, {});
    const counts = Object.values(rankCounts);
    if (counts.includes(4)) return EIGHT_GAME_SPECIAL_HAND_TYPES.FOUR_OF_A_KIND;
    if (counts.filter(c => c === 2).length === 4) return EIGHT_GAME_SPECIAL_HAND_TYPES.FOUR_PAIRS;
    return null;
};

const combinations = (array, k) => {
    const input = Array.isArray(array) ? array.filter(card => card && typeof card.rank === 'string' && typeof card.suit === 'string') : [];
    const result = [];
    function f(p, a, n) { if (n === 0) { result.push(p); return; } for (let i = 0; i < a.length; i++) f(p.concat(a[i]), a.slice(i + 1), n - 1); }
    f([], input, k);
    return result;
};

export const getAIEightGameBestArrangement = (fullHand) => {
    if (!Array.isArray(fullHand) || fullHand.length !== 8) return { front: [], middle: [], back: [] };
    const validHand = fullHand.filter(card => card && typeof card.rank === 'string' && typeof card.suit === 'string');
    const allFrontHands = combinations(validHand, 2);
    let bestArrangement = null;
    let maxScore = -Infinity;

    for (const currentFront of allFrontHands) {
        const remaining6 = validHand.filter(card => !currentFront.some(fc => fc.id === card.id));
        const allMiddleHands = combinations(remaining6, 3);
        for (const currentMiddle of allMiddleHands) {
            const currentBack = remaining6.filter(card => !currentMiddle.some(mc => mc.id === card.id));
            const currentArrangement = { front: currentFront, middle: currentMiddle, back: currentBack };
            if (validateEightGameArrangement(currentArrangement).isValid) {
                const frontScore = evaluateEightGameHand(currentFront).type;
                const middleScore = evaluateEightGameHand(currentMiddle).type;
                const backScore = evaluateEightGameHand(currentBack).type;
                const totalScore = frontScore + middleScore + backScore;
                if (totalScore > maxScore) {
                    maxScore = totalScore;
                    bestArrangement = currentArrangement;
                } else if (totalScore === maxScore && bestArrangement) {
                    // If scores are equal,优先后道/中道更大
                    const currentMiddleEval = evaluateEightGameHand(currentMiddle);
                    const bestMiddleEval = evaluateEightGameHand(bestArrangement.middle);
                    if (compareEightGameHands(currentMiddleEval, bestMiddleEval) > 0) {
                         bestArrangement = currentArrangement;
                    } else if (compareEightGameHands(currentMiddleEval, bestMiddleEval) === 0) {
                         const currentBackEval = evaluateEightGameHand(currentBack);
                         const bestBackEval = evaluateEightGameHand(bestArrangement.back);
                         if (compareEightGameHands(currentBackEval, bestBackEval) > 0) {
                             bestArrangement = currentArrangement;
                         }
                    }
                }
            }
        }
    }
    if (bestArrangement) return bestArrangement;
    console.warn("AI Warning: No valid 8-card arrangement found. Providing default sorted layout.");
    const sortedHand = sortEightGameCardsByRank(validHand);
    return { front: sortedHand.slice(6, 8), middle: sortedHand.slice(3, 6), back: sortedHand.slice(0, 3) };
};