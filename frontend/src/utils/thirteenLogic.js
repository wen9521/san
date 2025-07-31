/**
 * =================================================================================
 * 十三张游戏核心逻辑 (13-Card Poker Logic) - V3 (Robust Data Handling)
 * =================================================================================
 */

const RANKS = '23456789TJQKA';
const SUITS = { 'S': 4, 'H': 3, 'C': 2, 'D': 1 };
const HAND_TYPES = {
    STRAIGHT_FLUSH: 8, FOUR_OF_A_KIND: 7, FULL_HOUSE: 6, FLUSH: 5, STRAIGHT: 4,
    THREE_OF_A_KIND: 3, TWO_PAIR: 2, PAIR: 1, HIGH_CARD: 0, THREE_OF_A_KIND_FRONT: 3,
};

const getRankValue = (rank) => RANKS.indexOf(rank);

export const sortCards = (cards) => {
    if (!cards || !Array.isArray(cards)) return [];
    return [...cards].sort((a, b) => {
        if (!a || !b) return 0;
        const rankDiff = getRankValue(b.rank) - getRankValue(a.rank);
        if (rankDiff !== 0) return rankDiff;
        return SUITS[b.suit] - SUITS[a.suit];
    });
};

export function evaluateHand(hand) {
    if (!hand || hand.length === 0) return { type: HAND_TYPES.HIGH_CARD, value: [], hand: [] };
    const sortedHand = sortCards(hand);
    const ranks = sortedHand.map(c => c.rank);
    const suits = sortedHand.map(c => c.suit);
    const rankValues = sortedHand.map(c => getRankValue(c.rank));
    const rankCounts = ranks.reduce((acc, rank) => { acc[rank] = (acc[rank] || 0) + 1; return acc; }, {});
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const uniqueRankValues = [...new Set(rankValues)].sort((a, b) => b - a);
    const isFlush = new Set(suits).size === 1;
    const isWheel = JSON.stringify(uniqueRankValues) === JSON.stringify([12, 3, 2, 1, 0]);
    const isStraight = uniqueRankValues.length === 5 && (uniqueRankValues[0] - uniqueRankValues[4] === 4 || isWheel);
    if (hand.length === 3) {
        if (counts[0] === 3) return { type: HAND_TYPES.THREE_OF_A_KIND_FRONT, value: uniqueRankValues, hand: sortedHand };
        if (counts[0] === 2) return { type: HAND_TYPES.PAIR, value: uniqueRankValues, hand: sortedHand };
        return { type: HAND_TYPES.HIGH_CARD, value: uniqueRankValues, hand: sortedHand };
    }
    const value = isWheel ? [3, 2, 1, 0, 12] : uniqueRankValues;
    if (isStraight && isFlush) return { type: HAND_TYPES.STRAIGHT_FLUSH, value, hand: sortedHand };
    if (counts[0] === 4) return { type: HAND_TYPES.FOUR_OF_A_KIND, value, hand: sortedHand };
    if (counts[0] === 3 && counts[1] === 2) return { type: HAND_TYPES.FULL_HOUSE, value, hand: sortedHand };
    if (isFlush) return { type: HAND_TYPES.FLUSH, value, hand: sortedHand };
    if (isStraight) return { type: HAND_TYPES.STRAIGHT, value, hand: sortedHand };
    if (counts[0] === 3) return { type: HAND_TYPES.THREE_OF_A_KIND, value, hand: sortedHand };
    if (counts[0] === 2 && counts[1] === 2) return { type: HAND_TYPES.TWO_PAIR, value, hand: sortedHand };
    if (counts[0] === 2) return { type: HAND_TYPES.PAIR, value, hand: sortedHand };
    return { type: HAND_TYPES.HIGH_CARD, value, hand: sortedHand };
}

function compareHands(evaluatedA, evaluatedB) {
    if (evaluatedA.type !== evaluatedB.type) return evaluatedA.type - evaluatedB.type;
    for (let i = 0; i < evaluatedA.value.length; i++) {
        if (evaluatedA.value[i] !== evaluatedB.value[i]) return evaluatedA.value[i] - evaluatedB.value[i];
    }
    return 0;
}

export function validateThirteenArrangement(rows) {
    if (rows.front?.length !== 3 || rows.middle?.length !== 5 || rows.back?.length !== 5) return { isValid: false };
    const frontEval = evaluateHand(rows.front);
    const middleEval = evaluateHand(rows.middle);
    const backEval = evaluateHand(rows.back);
    if (compareHands(middleEval, frontEval) < 0 || compareHands(backEval, middleEval) < 0) return { isValid: false };
    return { isValid: true, frontEval, middleEval, backEval };
}

function getCombinations(array, size) {
    const results = [];
    function backtrack(start, combination) {
        if (combination.length === size) { results.push([...combination]); return; }
        for (let i = start; i < array.length; i++) {
            combination.push(array[i]);
            backtrack(i + 1, combination);
            combination.pop();
        }
    }
    backtrack(0, []);
    return results;
}

export function getAIThirteenBestArrangement(hand) {
    if (!hand || hand.length !== 13) return { front: [], middle: [], back: [] };

    //【已修复】确保全程使用完整的卡牌对象
    const cardObjects = hand; 
    let bestArrangement = null;
    let maxScore = -1;

    const frontCombinations = getCombinations(cardObjects, 3);
    for (const front of frontCombinations) {
        const remainingAfterFront = cardObjects.filter(c => !front.some(fc => fc.id === c.id));
        const middleCombinations = getCombinations(remainingAfterFront, 5);
        for (const middle of middleCombinations) {
            const back = remainingAfterFront.filter(c => !middle.some(mc => mc.id === c.id));
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
    
    //【已修复】提供一个绝对安全的后备方案
    if (!bestArrangement) {
        console.warn("AI could not find a valid 13-card arrangement. Providing default sorted layout.");
        const sortedHand = sortCards(cardObjects);
        return {
            front: sortedHand.slice(0, 3),
            middle: sortedHand.slice(3, 8),
            back: sortedHand.slice(8, 13)
        };
    }
    return bestArrangement;
}
