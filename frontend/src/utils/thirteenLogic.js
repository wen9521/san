/**
 * =================================================================================
 * 十三张游戏核心逻辑 (13-Card Poker Logic)
 *
 * 遵循的规则:
 * 1. 牌墩: 头道(3张), 中道(5张), 后道(5张)
 * 2. 牌型大小 (5张): 同花顺 > 铁支 > 葫芦 > 同花 > 顺子 > 三条 > 两对 > 对子 > 散牌
 * 3. 牌型大小 (3张): 三条 > 对子 > 散牌
 * 4. 基本规则: 后道 >= 中道 >= 头道，否则为 "相公" (mis-set)
 * 5. 特殊牌型: 一条龙, 至尊清龙, 三同花, 三顺子, 六对半, 等...
 * =================================================================================
 */

// 1. 定义常量 (Constants)
const RANKS = '23456789TJQKA';
const SUITS = { 'S': 4, 'H': 3, 'C': 2, 'D': 1 }; // 黑桃 > 红桃 > 梅花 > 方块

const HAND_TYPES = {
    // 5-Card Hands
    STRAIGHT_FLUSH: 8,
    FOUR_OF_A_KIND: 7,
    FULL_HOUSE: 6,
    FLUSH: 5,
    STRAIGHT: 4,
    THREE_OF_A_KIND: 3,
    TWO_PAIR: 2,
    PAIR: 1,
    HIGH_CARD: 0,
    // Special 3-Card Hand Type
    THREE_OF_A_KIND_FRONT: 3,
};

// Helper to get rank value
const getRankValue = (rank) => RANKS.indexOf(rank);

// Card parsing and sorting
const parseCard = (cardStr) => ({ rank: cardStr[0], suit: cardStr[1] });
const sortCards = (cards) => {
    return [...cards].sort((a, b) => {
        const rankDiff = getRankValue(b.rank) - getRankValue(a.rank);
        if (rankDiff !== 0) return rankDiff;
        return SUITS[b.suit] - SUITS[a.suit];
    });
};

/**
 * 评估一手牌 (3张或5张)
 * @param {Array<Object>} hand - e.g., [{rank: 'A', suit: 'S'}, ...]
 * @returns {Object} - e.g., { type: HAND_TYPES.PAIR, value: [12, 12, 10, 9, 8], hand: sortedHand }
 */
function evaluateHand(hand) {
    if (!hand || hand.length === 0) return { type: HAND_TYPES.HIGH_CARD, value: [], hand: [] };

    const sortedHand = sortCards(hand);
    const ranks = sortedHand.map(c => c.rank);
    const suits = sortedHand.map(c => c.suit);
    const rankValues = sortedHand.map(c => getRankValue(c.rank));

    const rankCounts = ranks.reduce((acc, rank) => {
        acc[rank] = (acc[rank] || 0) + 1;
        return acc;
    }, {});
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const uniqueRankValues = [...new Set(rankValues)].sort((a, b) => b - a);

    const isFlush = new Set(suits).size === 1;
    const isStraight = uniqueRankValues.length === 5 && (uniqueRankValues[0] - uniqueRankValues[4] === 4);
    // Handle A-5 straight (wheel)
    const isWheel = JSON.stringify(uniqueRankValues) === JSON.stringify([12, 3, 2, 1, 0]); // A, 5, 4, 3, 2

    // 3-Card Hand Evaluation
    if (hand.length === 3) {
        if (counts[0] === 3) return { type: HAND_TYPES.THREE_OF_A_KIND_FRONT, value: uniqueRankValues, hand: sortedHand };
        if (counts[0] === 2) return { type: HAND_TYPES.PAIR, value: uniqueRankValues, hand: sortedHand };
        return { type: HAND_TYPES.HIGH_CARD, value: uniqueRankValues, hand: sortedHand };
    }

    // 5-Card Hand Evaluation
    if (isStraight && isFlush) return { type: HAND_TYPES.STRAIGHT_FLUSH, value: isWheel ? [3,2,1,0,12] : uniqueRankValues, hand: sortedHand };
    if (counts[0] === 4) return { type: HAND_TYPES.FOUR_OF_A_KIND, value: uniqueRankValues, hand: sortedHand };
    if (counts[0] === 3 && counts[1] === 2) return { type: HAND_TYPES.FULL_HOUSE, value: uniqueRankValues, hand: sortedHand };
    if (isFlush) return { type: HAND_TYPES.FLUSH, value: uniqueRankValues, hand: sortedHand };
    if (isStraight || isWheel) return { type: HAND_TYPES.STRAIGHT, value: isWheel ? [3,2,1,0,12] : uniqueRankValues, hand: sortedHand };
    if (counts[0] === 3) return { type: HAND_TYPES.THREE_OF_A_KIND, value: uniqueRankValues, hand: sortedHand };
    if (counts[0] === 2 && counts[1] === 2) return { type: HAND_TYPES.TWO_PAIR, value: uniqueRankValues, hand: sortedHand };
    if (counts[0] === 2) return { type: HAND_TYPES.PAIR, value: uniqueRankValues, hand: sortedHand };
    
    return { type: HAND_TYPES.HIGH_CARD, value: uniqueRankValues, hand: sortedHand };
}

/**
 * 比较两手牌的强度
 * @returns {number} > 0 if handA > handB, < 0 if handA < handB, 0 if equal
 */
function compareHands(evaluatedA, evaluatedB) {
    if (evaluatedA.type !== evaluatedB.type) {
        return evaluatedA.type - evaluatedB.type;
    }
    for (let i = 0; i < evaluatedA.value.length; i++) {
        if (evaluatedA.value[i] !== evaluatedB.value[i]) {
            return evaluatedA.value[i] - evaluatedB.value[i];
        }
    }
    // Final tie-breaker by suit of highest card if values are identical (e.g., in flush)
    for (let i = 0; i < evaluatedA.hand.length; i++) {
        const suitDiff = SUITS[evaluatedA.hand[i].suit] - SUITS[evaluatedB.hand[i].suit];
        if (suitDiff !== 0) return suitDiff;
    }
    return 0;
}

/**
 * 验证十三张牌型是否合法 (后道 >= 中道 >= 头道)
 */
function validateThirteenArrangement(rows) {
    if (rows.front.length !== 3 || rows.middle.length !== 5 || rows.back.length !== 5) {
        return { isValid: false, message: '牌墩数量不正确' };
    }
    const frontEval = evaluateHand(rows.front);
    const middleEval = evaluateHand(rows.middle);
    const backEval = evaluateHand(rows.back);

    if (compareHands(middleEval, frontEval) < 0) {
        return { isValid: false, message: '中道小于头道，相公' };
    }
    if (compareHands(backEval, middleEval) < 0) {
        return { isValid: false, message: '后道小于中道，相公' };
    }
    return { isValid: true, frontEval, middleEval, backEval };
}

// Combinations helper function
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
    if (hand.length !== 13) return null;

    const parsedHand = hand.map(parseCard);
    let bestArrangement = null;
    let maxScore = -1;

    // Generate all combinations for the front hand
    const frontCombinations = getCombinations(parsedHand, 3);

    for (const front of frontCombinations) {
        const remainingAfterFront = parsedHand.filter(c => !front.includes(c));
        
        // Generate all combinations for the middle hand
        const middleCombinations = getCombinations(remainingAfterFront, 5);

        for (const middle of middleCombinations) {
            const back = remainingAfterFront.filter(c => !middle.includes(c));

            const arrangement = { front, middle, back };
            const validation = validateThirteenArrangement(arrangement);

            if (validation.isValid) {
                // Simple scoring heuristic: sum of hand type values, weighted
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

    return bestArrangement;
}

export {
    RANKS,
    SUITS,
    HAND_TYPES,
    parseCard,
    sortCards,
    evaluateHand,
    compareHands,
    validateThirteenArrangement,
    getAIThirteenBestArrangement
};
