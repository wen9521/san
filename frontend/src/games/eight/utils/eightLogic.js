// frontend/src/games/eight/utils/eightLogic.js

export const EIGHT_GAME_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const EIGHT_GAME_SUITS = { 'S': 4, 'H': 3, 'C': 2, 'D': 1 };

export const EIGHT_GAME_HAND_TYPES = {
    STRAIGHT_FLUSH: 6,
    THREE_OF_A_KIND: 5,
    STRAIGHT: 4,
    FLUSH: 3,
    PAIR: 2,
    HIGH_CARD: 1
};

export const EIGHT_GAME_SPECIAL_HAND_TYPES = {
    THREE_STRAIGHT_FLUSHES: { score: 38, name: '三同花顺' },
    THREE_STRAIGHTS: { score: 8, name: '三顺子' },
    FOUR_OF_A_KIND: { score: 8, name: '四条' },
    FOUR_PAIRS: { score: 8, name: '四对' }
};

const getRankValue = (card) => card && typeof card.rank === 'string' ? EIGHT_GAME_RANKS.indexOf(card.rank) : -1;
const getSuitValue = (card) => card && card.suit ? EIGHT_GAME_SUITS[card.suit?.toUpperCase?.()] : -1;

export const sortEightGameCardsByRank = (cards) => {
    if (!Array.isArray(cards)) return [];
    return cards
        .filter(card => card && typeof card.rank === 'string' && typeof card.suit === 'string')
        .sort((a, b) => {
            const rankA = getRankValue(a);
            const rankB = getRankValue(b);
            if (rankB !== rankA) return rankB - rankA;
            return getSuitValue(b) - getSuitValue(a);
        });
};

export const getHandTypeName = (evaluation) => {
    if (!evaluation || typeof evaluation.type === 'undefined') return '未知';
    const typeMap = {
        [EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH]: '同花顺',
        [EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND]: '三条',
        [EIGHT_GAME_HAND_TYPES.STRAIGHT]: '顺子',
        [EIGHT_GAME_HAND_TYPES.PAIR]: '对子',
        [EIGHT_GAME_HAND_TYPES.HIGH_CARD]: '高牌',
        [EIGHT_GAME_HAND_TYPES.FLUSH]: '同花'
    };
    return typeMap[evaluation.type] || '未知';
};

export const evaluateEightGameHand = (hand) => {
    if (!Array.isArray(hand) || hand.length === 0) return { type: EIGHT_GAME_HAND_TYPES.HIGH_CARD, highCards: [], hand: [] };
    const sortedHand = sortEightGameCardsByRank(hand);
    const ranks = sortedHand.map(getRankValue);
    const suits = sortedHand.map(c => c.suit);
    let highCards = [...ranks];
    const isFlush = new Set(suits).size === 1;
    let isStraight = false;
    if (ranks.length >= 2) {
        const isAKQ = ranks.includes(12) && ranks.includes(11);
        const isA23 = ranks.includes(12) && ranks.includes(0);
        if (isAKQ || isA23) {
            isStraight = true;
        } else {
            let consecutive = true;
            for (let i = 0; i < ranks.length - 1; i++) {
                if (ranks[i] !== ranks[i+1] + 1) {
                    consecutive = false;
                    break;
                }
            }
            isStraight = consecutive;
        }
    }
    let straightRank = 0;
    if (isStraight) {
        const hasAce = ranks.includes(12);
        const hasKing = ranks.includes(11);
        const hasTwo = ranks.includes(0);
        if (hasAce && hasKing) straightRank = 14;
        else if (hasAce && hasTwo) straightRank = 13;
        else straightRank = ranks[0];
    }
    const rankCounts = ranks.reduce((acc, rank) => { acc[rank] = (acc[rank] || 0) + 1; return acc; }, {});
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    let type;
    if (isStraight && isFlush) type = EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH;
    else if (counts[0] === 3) type = EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND;
    else if (isStraight) type = EIGHT_GAME_HAND_TYPES.STRAIGHT;
    else if (isFlush) type = EIGHT_GAME_HAND_TYPES.FLUSH;
    else if (counts[0] === 2) type = EIGHT_GAME_HAND_TYPES.PAIR;
    else type = EIGHT_GAME_HAND_TYPES.HIGH_CARD;
    if (type === EIGHT_GAME_HAND_TYPES.PAIR) {
        const pairRank = parseInt(Object.keys(rankCounts).find(rank => rankCounts[rank] === 2));
        highCards.sort((a, b) => (a === pairRank ? -1 : b === pairRank ? 1 : b - a));
    }
    return { type, highCards, hand: sortedHand, straightRank, mainSuit: getSuitValue(sortedHand[0]) };
};

export const compareEightGameHands = (handA, handB) => {
    if (handA.type !== handB.type) return handA.type - handB.type;
    if (handA.type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH) {
        if (handA.mainSuit !== handB.mainSuit) return handA.mainSuit - handB.mainSuit;
    }
    if (handA.type === EIGHT_GAME_HAND_TYPES.STRAIGHT || handA.type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH) {
        if (handA.straightRank !== handB.straightRank) return handA.straightRank - handB.straightRank;
    }
    for (let i = 0; i < handA.highCards.length; i++) {
        if (handA.highCards[i] !== handB.highCards[i]) return handA.highCards[i] - handB.highCards[i];
    }
    return handA.mainSuit - handB.mainSuit;
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
    const type = winningHand.type;
    if (area === 'front') return (type === EIGHT_GAME_HAND_TYPES.PAIR) ? winningHand.highCards[0] + 2 : 1;
    if (area === 'middle') {
        if (type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH) return 10;
        if (type === EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND) return 6;
        return 1;
    }
    if (area === 'back') {
        if (type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH) return 5;
        if (type === EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND) return 3;
        return 1;
    }
    return 1;
};

// Re-adding the exported function
export const calculateEightGameTotalScore = (playerARows, playerBRows) => {
    let playerAScore = 0;
    ['front', 'middle', 'back'].forEach(area => {
        const handA = evaluateEightGameHand(playerARows[area]);
        const handB = evaluateEightGameHand(playerBRows[area]);
        const comparison = compareEightGameHands(handA, handB);
        if (comparison !== 0) {
            const winnerHand = comparison > 0 ? handA : handB;
            const areaScore = getHandScore(winnerHand, area);
            playerAScore += (comparison > 0 ? areaScore : -areaScore);
        }
    });
    return { playerAScore, playerBScore: -playerAScore };
};

const combinations = (array, k) => {
    const result = [];
    function f(p, a, n) { if (n === 0) { result.push(p); return; } for (let i = 0; i < a.length; i++) f(p.concat(a[i]), a.slice(i + 1), n - 1); }
    f([], array, k);
    return result;
};

const canFormThreeStraights = (hand, flushRequired) => {
    const allFronts = combinations(hand, 2);
    for (const front of allFronts) {
        const frontEval = evaluateEightGameHand(front);
        const frontTypeOk = flushRequired ? frontEval.type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH : (frontEval.type === EIGHT_GAME_HAND_TYPES.STRAIGHT || frontEval.type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH);
        if (!frontTypeOk) continue;
        const remaining6 = hand.filter(c => !front.includes(c));
        const allMiddles = combinations(remaining6, 3);
        for (const middle of allMiddles) {
            const middleEval = evaluateEightGameHand(middle);
            const middleTypeOk = flushRequired ? middleEval.type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH : (middleEval.type === EIGHT_GAME_HAND_TYPES.STRAIGHT || middleEval.type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH);
            if (!middleTypeOk || compareEightGameHands(frontEval, middleEval) > 0) continue;
            const back = remaining6.filter(c => !middle.includes(c));
            const backEval = evaluateEightGameHand(back);
            const backTypeOk = flushRequired ? backEval.type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH : (backEval.type === EIGHT_GAME_HAND_TYPES.STRAIGHT || backEval.type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH);
            if (backTypeOk && compareEightGameHands(middleEval, backEval) <= 0) return true;
        }
    }
    return false;
}

export const checkForEightGameSpecialHand = (fullHand) => {
    if (!Array.isArray(fullHand) || fullHand.length !== 8) return null;
    if (canFormThreeStraights(fullHand, true)) return EIGHT_GAME_SPECIAL_HAND_TYPES.THREE_STRAIGHT_FLUSHES;
    if (canFormThreeStraights(fullHand, false)) return EIGHT_GAME_SPECIAL_HAND_TYPES.THREE_STRAIGHTS;
    const ranks = fullHand.map(getRankValue);
    const rankCounts = ranks.reduce((acc, rank) => { acc[rank] = (acc[rank] || 0) + 1; return acc; }, {});
    const counts = Object.values(rankCounts);
    if (counts.includes(4)) return EIGHT_GAME_SPECIAL_HAND_TYPES.FOUR_OF_A_KIND;
    if (counts.filter(c => c === 2).length === 4) return EIGHT_GAME_SPECIAL_HAND_TYPES.FOUR_PAIRS;
    return null;
};

export const getAIEightGameBestArrangement = (fullHand) => {
    if (!Array.isArray(fullHand) || fullHand.length !== 8) return { front: [], middle: [], back: [] };
    const allFrontHands = combinations(fullHand, 2);
    let bestArrangement = null;
    let maxScore = -Infinity;
    for (const currentFront of allFrontHands) {
        const remaining6 = fullHand.filter(card => !currentFront.some(fc => fc.id === card.id));
        const allMiddleHands = combinations(remaining6, 3);
        for (const currentMiddle of allMiddleHands) {
            const currentBack = remaining6.filter(card => !currentMiddle.some(mc => mc.id === card.id));
            const currentArrangement = { front: currentFront, middle: currentMiddle, back: currentBack };
            if (validateEightGameArrangement(currentArrangement).isValid) {
                const frontEval = evaluateEightGameHand(currentFront);
                const middleEval = evaluateEightGameHand(currentMiddle);
                const backEval = evaluateEightGameHand(currentBack);
                const totalScore = (frontEval.type * 1000 + frontEval.straightRank * 100 + frontEval.highCards.reduce((a,b)=>a+b,0) + frontEval.mainSuit) + (middleEval.type * 1000 + middleEval.straightRank * 100 + middleEval.highCards.reduce((a,b)=>a+b,0) + middleEval.mainSuit) + (backEval.type * 1000 + backEval.straightRank * 100 + backEval.highCards.reduce((a,b)=>a+b,0) + backEval.mainSuit);
                if (totalScore > maxScore) {
                    maxScore = totalScore;
                    bestArrangement = currentArrangement;
                }
            }
        }
    }
    if (bestArrangement) return bestArrangement;
    const sortedHand = sortEightGameCardsByRank(fullHand);
    return { front: sortedHand.slice(6, 8), middle: sortedHand.slice(3, 6), back: sortedHand.slice(0, 3) };
};
