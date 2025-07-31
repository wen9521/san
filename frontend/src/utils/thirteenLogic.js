/**
 * =================================================================================
 * 十三张游戏核心逻辑 (13-Card Poker Logic) - V2 (Corrected Data Handling)
 * =================================================================================
 */

// 1. 定义常量 (Constants)
const RANKS = '23456789TJQKA';
const SUITS = { 'S': 4, 'H': 3, 'C': 2, 'D': 1 }; // 黑桃 > 红桃 > 梅花 > 方块

const HAND_TYPES = {
    STRAIGHT_FLUSH: 8, FOUR_OF_A_KIND: 7, FULL_HOUSE: 6, FLUSH: 5, STRAIGHT: 4,
    THREE_OF_A_KIND: 3, TWO_PAIR: 2, PAIR: 1, HIGH_CARD: 0, THREE_OF_A_KIND_FRONT: 3,
};

const getRankValue = (rank) => RANKS.indexOf(rank);

// 卡牌对象排序函数
const sortCards = (cards) => {
    if (!cards) return [];
    return [...cards].sort((a, b) => {
        const rankDiff = getRankValue(b.rank) - getRankValue(a.rank);
        if (rankDiff !== 0) return rankDiff;
        return SUITS[b.suit] - SUITS[a.suit];
    });
};

/**
 * 评估一手牌 (3张或5张)
 */
function evaluateHand(hand) {
    if (!hand || hand.length === 0) return { type: HAND_TYPES.HIGH_CARD, value: [], hand: [] };

    const sortedHand = sortCards(hand);
    const ranks = sortedHand.map(c => c.rank);
    const suits = sortedHand.map(c => c.suit);
    const rankValues = sortedHand.map(c => getRankValue(c.rank));

    const rankCounts = ranks.reduce((acc, rank) => { acc[rank] = (acc[rank] || 0) + 1; return acc; }, {});
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const uniqueRankValues = [...new Set(rankValues)].sort((a, b) => b - a);

    const isFlush = new Set(suits).size === 1;
    const isWheel = JSON.stringify(uniqueRankValues) === JSON.stringify([12, 3, 2, 1, 0]); // A, 5, 4, 3, 2
    const isStraight = uniqueRankValues.length === 5 && (uniqueRankValues[0] - uniqueRankValues[4] === 4 || isWheel);

    if (hand.length === 3) {
        if (counts[0] === 3) return { type: HAND_TYPES.THREE_OF_A_KIND_FRONT, value: uniqueRankValues, hand: sortedHand };
        if (counts[0] === 2) return { type: HAND_TYPES.PAIR, value: uniqueRankValues, hand: sortedHand };
        return { type: HAND_TYPES.HIGH_CARD, value: uniqueRankValues, hand: sortedHand };
    }

    if (isStraight && isFlush) return { type: HAND_TYPES.STRAIGHT_FLUSH, value: isWheel ? [3,2,1,0,12] : uniqueRankValues, hand: sortedHand };
    if (counts[0] === 4) return { type: HAND_TYPES.FOUR_OF_A_KIND, value: uniqueRankValues, hand: sortedHand };
    if (counts[0] === 3 && counts[1] === 2) return { type: HAND_TYPES.FULL_HOUSE, value: uniqueRankValues, hand: sortedHand };
    if (isFlush) return { type: HAND_TYPES.FLUSH, value: uniqueRankValues, hand: sortedHand };
    if (isStraight) return { type: HAND_TYPES.STRAIGHT, value: isWheel ? [3,2,1,0,12] : uniqueRankValues, hand: sortedHand };
    if (counts[0] === 3) return { type: HAND_TYPES.THREE_OF_A_KIND, value: uniqueRankValues, hand: sortedHand };
    if (counts[0] === 2 && counts[1] === 2) return { type: HAND_TYPES.TWO_PAIR, value: uniqueRankValues, hand: sortedHand };
    if (counts[0] === 2) return { type: HAND_TYPES.PAIR, value: uniqueRankValues, hand: sortedHand };
    
    return { type: HAND_TYPES.HIGH_CARD, value: uniqueRankValues, hand: sortedHand };
}

/**
 * 比较两手牌的强度
 */
function compareHands(evaluatedA, evaluatedB) {
    if (evaluatedA.type !== evaluatedB.type) return evaluatedA.type - evaluatedB.type;
    for (let i = 0; i < evaluatedA.value.length; i++) {
        if (evaluatedA.value[i] !== evaluatedB.value[i]) return evaluatedA.value[i] - evaluatedB.value[i];
    }
    // Final tie-breaker by suit (already incorporated in sort)
    return 0;
}

/**
 * 验证十三张牌型是否合法
 */
function validateThirteenArrangement(rows) {
    if (rows.front?.length !== 3 || rows.middle?.length !== 5 || rows.back?.length !== 5) return { isValid: false, message: '牌墩数量不正确' };
    
    const frontEval = evaluateHand(rows.front);
    const middleEval = evaluateHand(rows.middle);
    const backEval = evaluateHand(rows.back);

    if (compareHands(middleEval, frontEval) < 0) return { isValid: false, message: '中道小于头道' };
    if (compareHands(backEval, middleEval) < 0) return { isValid: false, message: '后道小于中道' };
    
    return { isValid: true, frontEval, middleEval, backEval };
}

function getCombinations(array, size) {
    const results = [];
    function backtrack(start, combination) {
        if (combination.length === size) {
            results.push([...combination]);
            return;
        }
        for (let i = start; i < array.length; i++) {
            combination.push(array[i]);
            backtrack(i + 1, combination);
            combination.pop();
        }
    }
    backtrack(0, []);
    return results;
}

/**
 * AI 智能理牌核心功能
 */
function getAIThirteenBestArrangement(hand) {
    if (!hand || hand.length !== 13) return null;

    // 【已修复】直接使用传入的卡牌对象数组，不再进行错误的解析
    const cardObjects = hand;
    let bestArrangement = null;
    let maxScore = -1;

    const frontCombinations = getCombinations(cardObjects, 3);

    for (const front of frontCombinations) {
        const remainingAfterFront = cardObjects.filter(c => !front.includes(c));
        const middleCombinations = getCombinations(remainingAfterFront, 5);

        for (const middle of middleCombinations) {
            const back = remainingAfterFront.filter(c => !middle.includes(c));
            const arrangement = { front, middle, back };
            const validation = validateThirteenArrangement(arrangement);

            if (validation.isValid) {
                const score = validation.backEval.type * 100 + validation.middleEval.type * 10 + validation.frontEval.type;
                if (score > maxScore) {
                    maxScore = score;
                    bestArrangement = {
                        front: validation.frontEval.hand,
                        middle: validation.middleEval.hand,
                        back: validation.backEval.hand,
                    };
                }
            }
        }
    }
    // 如果找不到任何合法牌型，返回一个默认的、虽然可能不佳但合法的排列
    if (!bestArrangement) {
        return {
            front: cardObjects.slice(0, 3),
            middle: cardObjects.slice(3, 8),
            back: cardObjects.slice(8, 13)
        };
    }

    return bestArrangement;
}

export {
    sortCards,
    evaluateHand,
    validateThirteenArrangement,
    getAIThirteenBestArrangement
};
