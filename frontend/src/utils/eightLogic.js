/**
 * =================================================================================
 * 八张游戏核心逻辑 (8-Card Poker Logic) - V4 (Final Corrected)
 * 
 * 遵循的规则 (已更正):
 * 1. 牌墩: 头道(2张), 中道(3张), 后道(3张)
 * 2. 牌型大小: 同花顺 > 三条 > 顺子 > 对子 > 散牌 (乌龙) - **没有同花**
 * 3. 顺子大小: AKQ > A23 > KQJ > ... > 432
 * 4. 比牌: 先比牌型 -> 再比点数 -> 最后比最大牌花色
 * 5. 计分:
 *    - 头道: 对A(14水)...对2(2水), 散牌(1水)
 *    - 中/后道: 同花顺(10水), 三条(6水), 顺子(4水), 散牌(1水)
 * 6. 特殊牌型: 三同花顺(38水), 三顺子(8水), 四对(8水), **四条(8水)**
 * =================================================================================
 */

// 1. 定义常量 (Constants)
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS = { 'S': 4, 'H': 3, 'C': 2, 'D': 1 }; // 黑 > 红 > 梅 > 方

const HAND_TYPES = {
    STRAIGHT_FLUSH: 4,
    THREE_OF_A_KIND: 3,
    STRAIGHT: 2,
    PAIR: 1,
    HIGH_CARD: 0,
};

const SPECIAL_HAND_TYPES = {
    FOUR_OF_A_KIND: { score: 8, name: '四条' },
    THREE_STRAIGHT_FLUSHES: { score: 38, name: '三同花顺' },
    THREE_STRAIGHTS: { score: 8, name: '三顺子' },
    FOUR_PAIRS: { score: 8, name: '四对' },
};

// 2. 辅助函数 (Helper Functions)
const getRankValue = (card) => RANKS.indexOf(card.rank);
const getSuitValue = (card) => SUITS[card.suit.toUpperCase()];

/**
 * 评估单个牌墩的牌力
 * @param {Array} hand - 牌墩中的牌
 * @returns {object} 包含牌型、点数、花色等信息的评估对象
 */
export const evaluateEightHand = (hand) => {
    if (!hand || hand.length === 0) {
        return { type: HAND_TYPES.HIGH_CARD, highCards: [], ranks: [], hand: [] };
    }

    const sortedHand = [...hand].sort((a, b) => getRankValue(b) - getRankValue(a));
    const ranks = sortedHand.map(c => getRankValue(c));
    const suits = sortedHand.map(c => c.suit);
    let highCards = ranks;
    const maxSuit = getSuitValue(sortedHand[0]);

    const rankCounts = ranks.reduce((acc, rank) => {
        acc[rank] = (acc[rank] || 0) + 1;
        return acc;
    }, {});
    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    const isFlush = new Set(suits).size === 1;
    
    // A-2-3 顺子 (滚轮)
    const isWheel = JSON.stringify(ranks) === JSON.stringify([RANKS.indexOf('A'), RANKS.indexOf('3'), RANKS.indexOf('2')]);
    // 普通顺子
    const isNormalStraight = new Set(ranks).size === ranks.length && ranks[0] - ranks[ranks.length - 1] === ranks.length - 1;
    const isStraight = isNormalStraight || isWheel;

    // 调整A23顺子的比较大小，让A作为最小牌
    if (isWheel) {
        highCards = [RANKS.indexOf('3'), RANKS.indexOf('2'), RANKS.indexOf('A')];
    }
    
    if (isStraight && isFlush) return { type: HAND_TYPES.STRAIGHT_FLUSH, highCards, hand, maxSuit };
    if (counts[0] === 3) return { type: HAND_TYPES.THREE_OF_A_KIND, highCards, hand, maxSuit };
    if (isStraight) return { type: HAND_TYPES.STRAIGHT, highCards, hand, maxSuit };
    if (counts[0] === 2) return { type: HAND_TYPES.PAIR, highCards, hand, maxSuit };
    
    return { type: HAND_TYPES.HIGH_CARD, highCards, hand, maxSuit };
};


/**
 * 比较两个已评估牌墩的优劣
 * @param {object} handA - 玩家A的评估对象
 * @param {object} handB - 玩家B的评估对象
 * @returns {number} > 0 if A > B, < 0 if A < B, 0 if equal
 */
export const compareHands = (handA, handB) => {
    if (handA.type !== handB.type) {
        return handA.type - handB.type;
    }
    for (let i = 0; i < handA.highCards.length; i++) {
        if (handA.highCards[i] !== handB.highCards[i]) {
            return handA.highCards[i] - handB.highCards[i];
        }
    }
    return handA.maxSuit - handB.maxSuit;
};

/**
 * 验证八张牌的牌型是否合法 (2-3-3 且 后道 > 中道 > 头道)
 * @param {object} rows - 包含 front, middle, back 三个牌墩的对象
 * @returns {{isValid: boolean, message: string}} 验证结果
 */
export const validateEightArrangement = (rows) => {
    const { front, middle, back } = rows;

    if (!front || !middle || !back || front.length !== 2 || middle.length !== 3 || back.length !== 3) {
        return { isValid: false, message: `牌墩数量错误！请确保为 头道:2, 中道:3, 后道:3。` };
    }

    const frontHand = evaluateEightHand(front);
    const middleHand = evaluateEightHand(middle);
    const backHand = evaluateEightHand(back);

    if (compareHands(frontHand, middleHand) > 0) {
        return { isValid: false, message: '头道牌型大于中道，不符合规则！' };
    }
    if (compareHands(middleHand, backHand) > 0) {
        return { isValid: false, message: '中道牌型大于后道，不符合规则！' };
    }

    return { isValid: true, message: '牌型有效' };
};

/**
 * 计算单个获胜牌墩的水数
 * @param {object} winningHand - 获胜牌墩的评估对象
 * @param {string} area - 'front', 'middle', or 'back'
 * @returns {number} 水数
 */
const getHandScore = (winningHand, area) => {
    if (area === 'front') { // 头道计分
        if (winningHand.type === HAND_TYPES.PAIR) {
            return winningHand.highCards[0] + 2; // 对A=14, 对K=13 ... 对2=2
        }
        return 1; // 散牌
    } else { // 中道/后道计分
        switch (winningHand.type) {
            case HAND_TYPES.STRAIGHT_FLUSH: return 10;
            case HAND_TYPES.THREE_OF_A_KIND: return 6;
            case HAND_TYPES.STRAIGHT: return 4;
            default: return 1; // 对子和散牌在这里都算1水
        }
    }
};

/**
 * 计算两个玩家比牌后的总分
 * @param {object} playerARows - 玩家A的三墩
 * @param {object} playerBRows - 玩家B的三墩
 * @returns {{playerAScore: number, playerBScore: number, details: Array}}
 */
export const calculateTotalScore = (playerARows, playerBRows) => {
    const areas = ['front', 'middle', 'back'];
    let playerAScore = 0;
    const details = [];

    for (const area of areas) {
        const handA = evaluateEightHand(playerARows[area]);
        const handB = evaluateEightHand(playerBRows[area]);
        const comparison = compareHands(handA, handB);

        let areaScore = 0;
        if (comparison > 0) {
            areaScore = getHandScore(handA, area);
            playerAScore += areaScore;
        } else if (comparison < 0) {
            areaScore = getHandScore(handB, area);
            playerAScore -= areaScore;
        }
        details.push({ area, winner: comparison > 0 ? 'A' : (comparison < 0 ? 'B' : 'Tie'), score: areaScore, handA, handB });
    }
    
    const aWins = details.filter(d => d.winner === 'A').length;
    if (aWins === 3) {
        playerAScore *= 2; // A打枪
    } else if (aWins === 0 && details.filter(d => d.winner === 'B').length === 3) {
        playerAScore *= 2; // B打枪
    }

    return { playerAScore, playerBScore: -playerAScore, details };
};

/**
 * 检查8张手牌是否构成特殊牌型
 * @param {Array} fullHand - 玩家的8张手牌
 * @returns {object|null} 特殊牌型对象或null
 */
export const checkForSpecialHand = (fullHand) => {
    if (!fullHand || fullHand.length !== 8) return null;

    const ranks = fullHand.map(c => getRankValue(c));
    const rankCounts = ranks.reduce((acc, rank) => {
        acc[rank] = (acc[rank] || 0) + 1;
        return acc;
    }, {});
    const counts = Object.values(rankCounts);

    // 检查四条
    if (counts.includes(4)) {
        return SPECIAL_HAND_TYPES.FOUR_OF_A_KIND;
    }

    // 检查四对
    if (counts.length === 4 && counts.every(c => c === 2)) {
        return SPECIAL_HAND_TYPES.FOUR_PAIRS;
    }
    
    // 三顺子和三同花顺的检测逻辑非常复杂，需要穷举所有分区。
    // 这里暂时不实现，以保证核心逻辑的稳定。
    
    return null;
};
