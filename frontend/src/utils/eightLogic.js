/**
 * =================================================================================
 * 八张游戏核心逻辑 (8-Card Poker Logic) - V6 (Prefixed for Uniqueness)
 * =================================================================================
 */

// 1. 定义常量 (Constants) - 【已修改】
export const EIGHT_GAME_RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export const EIGHT_GAME_SUITS = { 'S': 4, 'H': 3, 'C': 2, 'D': 1 };

export const EIGHT_GAME_HAND_TYPES = {
    STRAIGHT_FLUSH: 4,
    THREE_OF_A_KIND: 3,
    STRAIGHT: 2,
    PAIR: 1,
    HIGH_CARD: 0,
};

export const EIGHT_GAME_SPECIAL_HAND_TYPES = {
    FOUR_OF_A_KIND: { score: 8, name: '四条' },
    THREE_STRAIGHT_FLUSHES: { score: 38, name: '三同花顺' },
    THREE_STRAIGHTS: { score: 8, name: '三顺子' },
    FOUR_PAIRS: { score: 8, name: '四对' },
};

// 2. 辅助函数 (Helper Functions)
const getRankValue = (card) => EIGHT_GAME_RANKS.indexOf(card.rank);
const getSuitValue = (card) => EIGHT_GAME_SUITS[card.suit.toUpperCase()];

/**
 * 【已修改】排序牌组
 */
export const sortEightGameCardsByRank = (cards) => {
    return [...cards].sort((a, b) => getRankValue(b) - getRankValue(a));
};

/**
 * 【已修改】评估单个牌墩
 */
export const evaluateEightGameHand = (hand) => {
    if (!hand || hand.length === 0) {
        return { type: EIGHT_GAME_HAND_TYPES.HIGH_CARD, highCards: [], ranks: [], hand: [] };
    }

    const sortedHand = [...hand].sort((a, b) => getRankValue(b) - getRankValue(a));
    const ranks = sortedHand.map(c => getRankValue(c));
    const suits = sortedHand.map(c => c.suit);
    let highCards = ranks;
    const maxSuit = getSuitValue(sortedHand[0]);

    const rankCounts = ranks.reduce((acc, rank) => { acc[rank] = (acc[rank] || 0) + 1; return acc; }, {});
    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    const isFlush = new Set(suits).size === 1;
    const isWheel = JSON.stringify(ranks) === JSON.stringify([EIGHT_GAME_RANKS.indexOf('A'), EIGHT_GAME_RANKS.indexOf('3'), EIGHT_GAME_RANKS.indexOf('2')]);
    const isNormalStraight = new Set(ranks).size === ranks.length && ranks[0] - ranks[ranks.length - 1] === ranks.length - 1;
    const isStraight = isNormalStraight || isWheel;

    if (isWheel) highCards = [EIGHT_GAME_RANKS.indexOf('3'), EIGHT_GAME_RANKS.indexOf('2'), EIGHT_GAME_RANKS.indexOf('A')];
    
    if (isStraight && isFlush) return { type: EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH, highCards, hand, maxSuit };
    if (counts[0] === 3) return { type: EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND, highCards, hand, maxSuit };
    if (isStraight) return { type: EIGHT_GAME_HAND_TYPES.STRAIGHT, highCards, hand, maxSuit };
    if (counts[0] === 2) return { type: EIGHT_GAME_HAND_TYPES.PAIR, highCards, hand, maxSuit };
    
    return { type: EIGHT_GAME_HAND_TYPES.HIGH_CARD, highCards, hand, maxSuit };
};


/**
 * 【已修改】比较两个牌墩
 */
export const compareEightGameHands = (handA, handB) => {
    if (handA.type !== handB.type) return handA.type - handB.type;
    for (let i = 0; i < handA.highCards.length; i++) {
        if (handA.highCards[i] !== handB.highCards[i]) return handA.highCards[i] - handB.highCards[i];
    }
    return handA.maxSuit - handB.maxSuit;
};

/**
 * 【已修改】验证牌型是否合法
 */
export const validateEightGameArrangement = (rows) => {
    const { front, middle, back } = rows;
    if (!front || !middle || !back || front.length !== 2 || middle.length !== 3 || back.length !== 3) {
        return { isValid: false, message: `牌墩数量错误！请确保为 头道:2, 中道:3, 后道:3。` };
    }
    const frontHand = evaluateEightGameHand(front);
    const middleHand = evaluateEightGameHand(middle);
    const backHand = evaluateEightGameHand(back);
    if (compareEightGameHands(frontHand, middleHand) > 0) return { isValid: false, message: '头道牌型大于中道，不符合规则！' };
    if (compareEightGameHands(middleHand, backHand) > 0) return { isValid: false, message: '中道牌型大于后道，不符合规则！' };
    return { isValid: true, message: '牌型有效' };
};

const getHandScore = (winningHand, area) => {
    if (area === 'front') {
        return winningHand.type === EIGHT_GAME_HAND_TYPES.PAIR ? winningHand.highCards[0] + 2 : 1;
    }
    switch (winningHand.type) {
        case EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH: return 10;
        case EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND: return 6;
        case EIGHT_GAME_HAND_TYPES.STRAIGHT: return 4;
        default: return 1;
    }
};

/**
 * 【已修改】计算总分
 */
export const calculateEightGameTotalScore = (playerARows, playerBRows) => {
    const areas = ['front', 'middle', 'back'];
    let playerAScore = 0;
    const details = [];
    for (const area of areas) {
        const handA = evaluateEightGameHand(playerARows[area]);
        const handB = evaluateEightGameHand(playerBRows[area]);
        const comparison = compareEightGameHands(handA, handB);
        let areaScore = comparison !== 0 ? getHandScore(comparison > 0 ? handA : handB, area) : 0;
        playerAScore += comparison > 0 ? areaScore : -areaScore;
        details.push({ area, winner: comparison > 0 ? 'A' : (comparison < 0 ? 'B' : 'Tie'), score: areaScore, handA, handB });
    }
    const aWins = details.filter(d => d.winner === 'A').length;
    if (aWins === 3 || (aWins === 0 && details.filter(d => d.winner === 'B').length === 3)) {
        playerAScore *= 2;
    }
    return { playerAScore, playerBScore: -playerAScore, details };
};

/**
 * 【已修改】检查特殊牌型
 */
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

/**
 * 【已修改】AI 智能理牌
 */
export const getAIEightGameBestArrangement = (fullHand) => {
    if (!fullHand || fullHand.length !== 8) return null;
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
    console.warn("AI Warning: No valid 8-card arrangement found.", fullHand);
    return null;
};
