// 卡牌点数和花色定义
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
const rankToValue = RANKS.reduce((obj, rank, i) => ({ ...obj, [rank]: i + 2 }), {});
const suitToValue = { 'spades': 4, 'hearts': 3, 'clubs': 2, 'diamonds': 1 };
const HAND_TYPES = {
    HIGH_CARD: { name: '高牌', score: 1 }, PAIR: { name: '对子', score: 2 }, TWO_PAIR: { name: '两对', score: 3 }, THREE_OF_A_KIND: { name: '三条', score: 4 }, STRAIGHT: { name: '顺子', score: 5 }, FLUSH: { name: '同花', score: 6 }, FULL_HOUSE: { name: '葫芦', score: 7 }, FOUR_OF_A_KIND: { name: '铁支', score: 8 }, STRAIGHT_FLUSH: { name: '同花顺', score: 9 },
};

export const sortCardsByRank = (cards) => [...cards].sort((a, b) => rankToValue[b.rank] - rankToValue[a.rank]);
export const sortCardsBySuit = (cards) => [...cards].sort((a, b) => {
    if (suitToValue[b.suit] !== suitToValue[a.suit]) return suitToValue[b.suit] - suitToValue[a.suit];
    return rankToValue[b.rank] - rankToValue[a.rank];
});

export const getHandDetails = (cards) => {
    if (!cards || cards.length === 0) return null;
    const sorted = sortCardsByRank(cards);
    const values = sorted.map(c => rankToValue[c.rank]);
    const suits = sorted.map(c => c.suit);
    const isFlush = new Set(suits).size === 1;
    const isWheelStraight = JSON.stringify(values) === JSON.stringify([14, 5, 4, 3, 2]);
    const straightValues = isWheelStraight ? [5, 4, 3, 2, 1] : values;
    const isStraight = sorted.every((c, i) => (i === 0) || (isWheelStraight && i === 1 ? straightValues[i] === straightValues[i - 1] - 1 : values[i] === values[i - 1] - 1));
    if (isStraight && isFlush) return { type: HAND_TYPES.STRAIGHT_FLUSH, primaryValue: straightValues[0], name: HAND_TYPES.STRAIGHT_FLUSH.name, cards: sorted };
    const valueCounts = values.reduce((obj, val) => ({ ...obj, [val]: (obj[val] || 0) + 1 }), {});
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const primaryGroupValue = parseInt(Object.keys(valueCounts).find(k => valueCounts[k] === counts[0]));
    const secondaryGroupValue = counts.length > 1 ? parseInt(Object.keys(valueCounts).find(k => valueCounts[k] === counts[1])) : 0;
    if (counts[0] === 4) return { type: HAND_TYPES.FOUR_OF_A_KIND, primaryValue: primaryGroupValue, name: HAND_TYPES.FOUR_OF_A_KIND.name, cards: sorted };
    if (counts[0] === 3 && counts[1] === 2) return { type: HAND_TYPES.FULL_HOUSE, primaryValue: primaryGroupValue, name: HAND_TYPES.FULL_HOUSE.name, cards: sorted };
    if (isFlush) return { type: HAND_TYPES.FLUSH, primaryValue: values, name: HAND_TYPES.FLUSH.name, cards: sorted };
    if (isStraight) return { type: HAND_TYPES.STRAIGHT, primaryValue: straightValues[0], name: HAND_TYPES.STRAIGHT.name, cards: sorted };
    if (counts[0] === 3) return { type: HAND_TYPES.THREE_OF_A_KIND, primaryValue: primaryGroupValue, name: HAND_TYPES.THREE_OF_A_KIND.name, cards: sorted };
    if (counts[0] === 2 && counts[1] === 2) return { type: HAND_TYPES.TWO_PAIR, primaryValue: Math.max(primaryGroupValue, secondaryGroupValue), name: HAND_TYPES.TWO_PAIR.name, cards: sorted };
    if (counts[0] === 2) return { type: HAND_TYPES.PAIR, primaryValue: primaryGroupValue, name: HAND_TYPES.PAIR.name, cards: sorted };
    return { type: HAND_TYPES.HIGH_CARD, primaryValue: values, name: HAND_TYPES.HIGH_CARD.name, cards: sorted };
};

export const compareHands = (handA, handB) => {
    if (!handA || !handB) return 0;
    if (handA.type.score !== handB.type.score) return handA.type.score - handB.type.score;
    if (Array.isArray(handA.primaryValue)) {
        for (let i = 0; i < handA.primaryValue.length; i++) {
            if (handA.primaryValue[i] !== handB.primaryValue[i]) return handA.primaryValue[i] - handB.primaryValue[i];
        }
        return 0;
    }
    return handA.primaryValue - handB.primaryValue;
};

export const validateArrangement = (rows) => {
    if (rows.front.length !== 3 || rows.middle.length !== 5 || rows.back.length !== 5) return { isValid: false, message: "请将所有牌放入正确位置" };
    const d = { front: getHandDetails(rows.front), middle: getHandDetails(rows.middle), back: getHandDetails(rows.back) };
    if (compareHands(d.middle, d.front) < 0) return { isValid: false, message: `规则错误: 中道(${d.middle.name}) 必须大于等于前道(${d.front.name})` };
    if (compareHands(d.back, d.middle) < 0) return { isValid: false, message: `规则错误: 后道(${d.back.name}) 必须大于等于中道(${d.middle.name})` };
    return { isValid: true, message: "牌型合法！", details: { front: d.front.name, middle: d.middle.name, back: d.back.name }};
};

export const getAIBestArrangement = (hand) => {
    let remaining = [...hand];
    let back = sortCardsByRank(remaining).slice(0, 5);
    remaining = remaining.filter(c => !back.find(bc => bc.id === c.id));
    let middle = sortCardsByRank(remaining).slice(0, 5);
    remaining = remaining.filter(c => !middle.find(mc => mc.id === c.id));
    let front = remaining;
    if (compareHands(getHandDetails(back), getHandDetails(middle)) < 0) [back, middle] = [middle, back];
    return { front: sortCardsByRank(front), middle: sortCardsByRank(middle), back: sortCardsByRank(back) };
};

/**
 * 新增：计算所有玩家的分数
 * @param {Array} players - 包含所有玩家信息的数组
 * @returns {Object} 包含每个玩家牌型、得分和比对详情的对象
 */
export const calculateAllScores = (players) => {
    const playerDetails = players.map(p => ({
        ...p,
        details: {
            front: getHandDetails(p.rows.front),
            middle: getHandDetails(p.rows.middle),
            back: getHandDetails(p.rows.back),
        },
        scores: { front: 0, middle: 0, back: 0, total: 0 }
    }));

    const rows = ['front', 'middle', 'back'];

    // 1v1 两两比对
    for (let i = 0; i < playerDetails.length; i++) {
        for (let j = i + 1; j < playerDetails.length; j++) {
            rows.forEach(row => {
                const comparison = compareHands(playerDetails[i].details[row], playerDetails[j].details[row]);
                if (comparison > 0) { // i 赢 j
                    playerDetails[i].scores[row]++;
                    playerDetails[j].scores[row]--;
                } else if (comparison < 0) { // j 赢 i
                    playerDetails[i].scores[row]--;
                    playerDetails[j].scores[row]++;
                }
            });
        }
    }

    // 计算总分和打枪
    playerDetails.forEach(p => {
        p.scores.total = p.scores.front + p.scores.middle + p.scores.back;
        const winCount = rows.filter(row => p.scores[row] > 0).length;
        if (winCount === 3) { // 简单打枪逻辑
            p.scores.total *= 2;
        }
    });

    return playerDetails;
};
// ... (所有旧代码保持不变，只在末尾增加一个函数)

// --- 文件顶部所有函数 sortCardsByRank, getHandDetails, calculateAllScores 等保持不变 ---

/**
 * 新增辅助函数：从所有牌墩中找到一张牌
 * @param {Object} rows - 包含 front, middle, back 的对象
 * @param {string} cardId - 要查找的卡牌ID
 * @returns {Object|null} 找到的卡牌对象或null
 */
export const findCardInRows = (rows, cardId) => {
    for (const rowId in rows) {
        const card = rows[rowId].find(c => c.id === cardId);
        if (card) {
            return card;
        }
    }
    return null;
};
