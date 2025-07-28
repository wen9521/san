// 卡牌点数和花色定义
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
const rankToValue = RANKS.reduce((obj, rank, i) => ({ ...obj, [rank]: i + 2 }), {});
const suitToValue = { 'spades': 4, 'hearts': 3, 'clubs': 2, 'diamonds': 1 };
const HAND_TYPES = {
    HIGH_CARD: { name: '乌龙', score: 1 },
    PAIR: { name: '对子', score: 2 },
    TWO_PAIR: { name: '两对', score: 3 },
    THREE_OF_A_KIND: { name: '三条', score: 4 },
    STRAIGHT: { name: '顺子', score: 5 },
    FLUSH: { name: '同花', score: 6 },
    FULL_HOUSE: { name: '葫芦', score: 7 },
    FOUR_OF_A_KIND: { name: '铁支', score: 8 },
    STRAIGHT_FLUSH: { name: '同花顺', score: 9 },
};

export const sortCardsByRank = (cards) => [...cards].sort((a, b) => rankToValue[b.rank] - rankToValue[a.rank]);
export const sortCardsBySuit = (cards) => [...cards].sort((a, b) => {
    if (suitToValue[b.suit] !== suitToValue[a.suit]) return suitToValue[b.suit] - suitToValue[a.suit];
    return rankToValue[b.rank] - rankToValue[a.rank];
});

/**
 * 【核心重写】: 获取一手牌的详细信息
 * @param {Array} cards - 包含3张或5张牌的数组
 * @returns {Object|null} 包含牌型信息的对象
 */
export const getHandDetails = (cards) => {
    if (!cards || cards.length === 0 || (cards.length !== 3 && cards.length !== 5)) return null;

    const sorted = sortCardsByRank(cards);
    const values = sorted.map(c => rankToValue[c.rank]);
    const suits = sorted.map(c => c.suit);
    const valueCounts = values.reduce((obj, val) => ({ ...obj, [val]: (obj[val] || 0) + 1 }), {});
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const primaryGroupValue = parseInt(Object.keys(valueCounts).find(k => valueCounts[k] === counts[0]));

    // --- 三张牌的特殊逻辑 ---
    if (cards.length === 3) {
        if (counts[0] === 3) { // 三条
            return { type: HAND_TYPES.THREE_OF_A_KIND, primaryValue: primaryGroupValue, kickerValues: [], cards: sorted };
        }
        if (counts[0] === 2) { // 对子
            const pairValue = primaryGroupValue;
            const kickerValue = values.find(v => v !== pairValue);
            return { type: HAND_TYPES.PAIR, primaryValue: pairValue, kickerValues: [kickerValue], cards: sorted };
        }
        // 乌龙
        return { type: HAND_TYPES.HIGH_CARD, primaryValue: 0, kickerValues: values, cards: sorted };
    }

    // --- 五张牌的逻辑 ---
    const isFlush = new Set(suits).size === 1;
    const isWheelStraight = JSON.stringify(values) === JSON.stringify([14, 5, 4, 3, 2]); // A-2-3-4-5
    const isStraight = values.every((v, i) => i === 0 || v === values[i-1] - 1) || isWheelStraight;
    
    let straightValue = 0;
    if (isStraight) {
        straightValue = isWheelStraight ? 5 : values[0]; // A-2-3-4-5顺子中A算小
    }
    
    if (isStraight && isFlush) {
        return { type: HAND_TYPES.STRAIGHT_FLUSH, primaryValue: straightValue, kickerValues: [], cards: sorted };
    }
    if (counts[0] === 4) {
        const kicker = values.find(v => v !== primaryGroupValue);
        return { type: HAND_TYPES.FOUR_OF_A_KIND, primaryValue: primaryGroupValue, kickerValues: [kicker], cards: sorted };
    }
    if (counts[0] === 3 && counts[1] === 2) {
        const pairValue = parseInt(Object.keys(valueCounts).find(k => valueCounts[k] === 2));
        return { type: HAND_TYPES.FULL_HOUSE, primaryValue: primaryGroupValue, kickerValues: [pairValue], cards: sorted };
    }
    if (isFlush) {
        return { type: HAND_TYPES.FLUSH, primaryValue: 0, kickerValues: values, cards: sorted };
    }
    if (isStraight) {
        return { type: HAND_TYPES.STRAIGHT, primaryValue: straightValue, kickerValues: [], cards: sorted };
    }
    if (counts[0] === 3) {
        const kickers = values.filter(v => v !== primaryGroupValue);
        return { type: HAND_TYPES.THREE_OF_A_KIND, primaryValue: primaryGroupValue, kickerValues: kickers, cards: sorted };
    }
    if (counts[0] === 2 && counts[1] === 2) {
        const pairValues = Object.keys(valueCounts).filter(k => valueCounts[k] === 2).map(Number);
        const kicker = values.find(v => !pairValues.includes(v));
        return { type: HAND_TYPES.TWO_PAIR, primaryValue: Math.max(...pairValues), kickerValues: [Math.min(...pairValues), kicker], cards: sorted };
    }
    if (counts[0] === 2) {
        const kickers = values.filter(v => v !== primaryGroupValue);
        return { type: HAND_TYPES.PAIR, primaryValue: primaryGroupValue, kickerValues: kickers, cards: sorted };
    }
    return { type: HAND_TYPES.HIGH_CARD, primaryValue: 0, kickerValues: values, cards: sorted };
};


/**
 * 【核心重写】: 比较两手牌的大小
 * @param {Object} handA - 牌A的详细信息
 * @param {Object} handB - 牌B的详细信息
 * @returns {number} >0表示A大, <0表示B大, 0表示一样大
 */
export const compareHands = (handA, handB) => {
    if (!handA || !handB) return 0;
    
    // 1. 比较牌型分数
    if (handA.type.score !== handB.type.score) {
        return handA.type.score - handB.type.score;
    }
    
    // 2. 牌型相同，比较主牌值
    if (handA.primaryValue !== handB.primaryValue) {
        return handA.primaryValue - handB.primaryValue;
    }
    
    // 3. 主牌值相同，逐一比较“踢脚牌”(kicker)
    for (let i = 0; i < handA.kickerValues.length; i++) {
        if (handA.kickerValues[i] !== handB.kickerValues[i]) {
            return handA.kickerValues[i] - handB.kickerValues[i];
        }
    }
    
    return 0; // 完全相同
};

// --- 以下函数保持不变，但为了完整性全部提供 ---
export const validateArrangement = (rows) => {
    if (!rows || rows.front.length !== 3 || rows.middle.length !== 5 || rows.back.length !== 5) {
        return { isValid: false, message: "请将所有牌放入正确位置" };
    }
    const d = { front: getHandDetails(rows.front), middle: getHandDetails(rows.middle), back: getHandDetails(rows.back) };
    if (!d.front || !d.middle || !d.back) {
        return { isValid: false, message: "牌墩存在无效牌" };
    }
    if (compareHands(d.middle, d.front) < 0) {
        return { isValid: false, message: `规则错误: 中道(${d.middle.type.name}) 必须大于等于前道(${d.front.type.name})` };
    }
    if (compareHands(d.back, d.middle) < 0) {
        return { isValid: false, message: `规则错误: 后道(${d.back.type.name}) 必须大于等于中道(${d.middle.type.name})` };
    }
    return { isValid: true, message: "牌型合法！", details: { front: d.front.type.name, middle: d.middle.type.name, back: d.back.type.name }};
};

export const getAIBestArrangement = (hand) => {
    // 这是一个非常简化的AI，真实游戏AI会复杂得多
    let remaining = [...hand];
    let back, middle, front;
    back = sortCardsByRank(remaining).slice(0, 5);
    remaining = remaining.filter(c => !back.find(bc => bc.id === c.id));
    middle = sortCardsByRank(remaining).slice(0, 5);
    remaining = remaining.filter(c => !middle.find(mc => mc.id === c.id));
    front = remaining;
    if (compareHands(getHandDetails(back), getHandDetails(middle)) < 0) {
        [back, middle] = [middle, back];
    }
    return { front: sortCardsByRank(front), middle: sortCardsByRank(middle), back: sortCardsByRank(back) };
};

export const calculateAllScores = (players) => {
    const playerDetails = players.map(p => ({
        ...p,
        details: { front: getHandDetails(p.rows.front), middle: getHandDetails(p.rows.middle), back: getHandDetails(p.rows.back) },
        scores: { front: 0, middle: 0, back: 0, total: 0 }
    }));
    const rows = ['front', 'middle', 'back'];
    for (let i = 0; i < playerDetails.length; i++) {
        for (let j = i + 1; j < playerDetails.length; j++) {
            rows.forEach(row => {
                const comparison = compareHands(playerDetails[i].details[row], playerDetails[j].details[row]);
                if (comparison > 0) {
                    playerDetails[i].scores[row]++;
                    playerDetails[j].scores[row]--;
                } else if (comparison < 0) {
                    playerDetails[i].scores[row]--;
                    playerDetails[j].scores[row]++;
                }
            });
        }
    }
    playerDetails.forEach(p => {
        p.scores.total = p.scores.front + p.scores.middle + p.scores.back;
        const winCount = rows.filter(row => p.scores[row] > 0).length;
        if (winCount === 3) { p.scores.total *= 2; }
    });
    return playerDetails;
};

export const findCardInRows = (rows, cardId) => {
    for (const rowId in rows) {
        const card = rows[rowId].find(c => c.id === cardId);
        if (card) {
            return card;
        }
    }
    return null;
};
