// frontend/src/games/eight/utils/eightLogic.js

export const EIGHT_GAME_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const EIGHT_GAME_SUITS = { 'S': 4, 'H': 3, 'C': 2, 'D': 1 };

// 更新牌型定义
export const EIGHT_GAME_HAND_TYPES = {
    STRAIGHT_FLUSH: 6,
    THREE_OF_A_KIND: 5,
    STRAIGHT: 4,
    FLUSH: 3, // Although not scored, needed for logic
    PAIR: 2,
    HIGH_CARD: 1
};

// 更新特殊牌型和分数
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
        [EIGHT_GAME_HAND_TYPES.FLUSH]: '同花' // Not used for scoring but good for debug
    };
    return typeMap[evaluation.type] || '未知';
};

// 重写牌型评估函数，以支持2张牌的顺子
export const evaluateEightGameHand = (hand) => {
    if (!Array.isArray(hand) || hand.length === 0) return { type: EIGHT_GAME_HAND_TYPES.HIGH_CARD, highCards: [], hand: [] };
    
    const sortedHand = sortEightGameCardsByRank(hand);
    const ranks = sortedHand.map(getRankValue);
    const suits = sortedHand.map(c => c.suit);
    const highCards = ranks;
    const isFlush = new Set(suits).size === 1;

    // 检查是否是顺子
    const isConsecutive = (rankArr) => {
        for (let i = 0; i < rankArr.length - 1; i++) {
            if (rankArr[i] !== rankArr[i+1] + 1) return false;
        }
        return true;
    }
    const isWheel = JSON.stringify(ranks) === JSON.stringify([12, 0]) || JSON.stringify(ranks) === JSON.stringify([12, 1, 0]); // A-2 or A-2-3
    const isStraight = isConsecutive(ranks) || isWheel;

    // 为顺子确定用于比较大小的 "最高牌"
    let straightRank = 0;
    if (isStraight) {
        straightRank = (isWheel && ranks.includes(0)) ? ranks[1] : ranks[0];
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

    // 对于对子，把对子的牌放在最前面
    if (type === EIGHT_GAME_HAND_TYPES.PAIR) {
        const pairRank = parseInt(Object.keys(rankCounts).find(rank => rankCounts[rank] === 2));
        highCards.sort((a, b) => {
            if (a === pairRank) return -1;
            if (b === pairRank) return 1;
            return b - a;
        });
    }

    return { type, highCards, hand: sortedHand, straightRank, mainSuit: getSuitValue(sortedHand[0]) };
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

// 重写计分函数
const getHandScore = (winningHand, area) => {
    const type = winningHand.type;

    if (area === 'front') {
        if (type === EIGHT_GAME_HAND_TYPES.PAIR) {
            // A=14, K=13, ..., 2=2
            return winningHand.highCards[0] + 2;
        }
        return 1;
    }

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

// 更新总分计算函数，移除全垒打
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
    return { playerAScore, playerBScore: -playerAScore, details };
};

// --- 特殊牌型检测 ---

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
        if (flushRequired ? frontEval.type !== EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH : frontEval.type !== EIGHT_GAME_HAND_TYPES.STRAIGHT && frontEval.type !== EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH) continue;

        const remaining6 = hand.filter(c => !front.includes(c));
        const allMiddles = combinations(remaining6, 3);
        
        for (const middle of allMiddles) {
            const middleEval = evaluateEightGameHand(middle);
            if (flushRequired ? middleEval.type !== EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH : middleEval.type !== EIGHT_GAME_HAND_TYPES.STRAIGHT && middleEval.type !== EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH) continue;
            
            if (compareEightGameHands(frontEval, middleEval) > 0) continue;

            const back = remaining6.filter(c => !middle.includes(c));
            const backEval = evaluateEightGameHand(back);

            if (flushRequired ? backEval.type !== EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH : backEval.type !== EIGHT_GAME_HAND_TYPES.STRAIGHT && backEval.type !== EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH) continue;
            if (compareEightGameHands(middleEval, backEval) > 0) continue;

            // Found a valid arrangement
            return true;
        }
    }
    return false;
}

// 重写特殊牌型检测函数
export const checkForEightGameSpecialHand = (fullHand) => {
    if (!Array.isArray(fullHand) || fullHand.length !== 8) return null;

    // 1. 检查三同花顺
    if (canFormThreeStraights(fullHand, true)) {
        return EIGHT_GAME_SPECIAL_HAND_TYPES.THREE_STRAIGHT_FLUSHES;
    }
    // 2. 检查三顺子
    if (canFormThreeStraights(fullHand, false)) {
        return EIGHT_GAME_SPECIAL_HAND_TYPES.THREE_STRAIGHTS;
    }
    
    // 3. 检查四条和四对
    const ranks = fullHand.map(getRankValue);
    const rankCounts = ranks.reduce((acc, rank) => { acc[rank] = (acc[rank] || 0) + 1; return acc; }, {});
    const counts = Object.values(rankCounts);
    if (counts.includes(4)) return EIGHT_GAME_SPECIAL_HAND_TYPES.FOUR_OF_A_KIND;
    if (counts.filter(c => c === 2).length === 4) return EIGHT_GAME_SPECIAL_HAND_TYPES.FOUR_PAIRS;

    return null;
};

// AI理牌逻辑 (保持不变，但会受益于更新的评估函数)
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
                const frontScore = evaluateEightGameHand(currentFront).type;
                const middleScore = evaluateEightGameHand(currentMiddle).type;
                const backScore = evaluateEightGameHand(currentBack).type;
                const totalScore = frontScore + middleScore + backScore;

                if (totalScore > maxScore) {
                    maxScore = totalScore;
                    bestArrangement = currentArrangement;
                }
            }
        }
    }
    if (bestArrangement) return bestArrangement;

    // 如果找不到有效组合，则使用默认的倒序排列
    const sortedHand = sortEightGameCardsByRank(fullHand);
    return { front: sortedHand.slice(6, 8), middle: sortedHand.slice(3, 6), back: sortedHand.slice(0, 3) };
};