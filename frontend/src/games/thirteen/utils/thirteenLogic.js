// --- Card and Hand Evaluation Logic for Thirteen ---

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
const SUITS = ['D', 'C', 'H', 'S']; // Diamonds, Clubs, Hearts, Spades

const getRankValue = (card) => RANKS.indexOf(card.rank);
const getSuitValue = (card) => SUITS.indexOf(card.suit);

export const sortThirteenGameCardsByRank = (cards) => {
    if (!cards || !Array.isArray(cards)) return [];
    return [...cards].sort((a, b) => {
        const rankDiff = getRankValue(b) - getRankValue(a);
        if (rankDiff !== 0) return rankDiff;
        return getSuitValue(b) - getSuitValue(a);
    });
};

export const evaluateThirteenGameHand = (hand) => {
    if (!hand || hand.length === 0) return { name: '无效', value: 0, highCards: [] };

    const ranks = hand.map(c => getRankValue(c)).sort((a, b) => b - a);
    const suits = hand.map(c => c.suit);
    const rankCounts = ranks.reduce((acc, r) => { acc[r] = (acc[r] || 0) + 1; return acc; }, {});
    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    
    const isFlush = new Set(suits).size === 1;
    const isStraight = new Set(ranks).size === hand.length && ranks[0] - ranks[hand.length - 1] === hand.length - 1;
    // Ace-low straight (A-2-3-4-5)
    const isWheel = JSON.stringify(ranks) === JSON.stringify([12, 3, 2, 1, 0]);

    if (isStraight && isFlush) return { name: '同花顺', value: 8, highCards: ranks };
    if (counts[0] === 4) return { name: '铁支', value: 7, highCards: ranks };
    if (counts[0] === 3 && counts[1] === 2) return { name: '葫芦', value: 6, highCards: ranks };
    if (isFlush) return { name: '同花', value: 5, highCards: ranks };
    if (isStraight || isWheel) return { name: '顺子', value: 4, highCards: isWheel ? [3, 2, 1, 0, -1] : ranks };
    if (counts[0] === 3) return { name: '三条', value: 3, highCards: ranks };
    if (counts[0] === 2 && counts[1] === 2) return { name: '两对', value: 2, highCards: ranks };
    if (counts[0] === 2) return { name: '一对', value: 1, highCards: ranks };
    
    return { name: '乌龙', value: 0, highCards: ranks };
};

export const getHandTypeName = (evaluation) => {
    return evaluation ? evaluation.name : '未知';
};

const compareHands = (handA, handB) => {
    const evalA = evaluateThirteenGameHand(handA);
    const evalB = evaluateThirteenGameHand(handB);
    if (evalA.value !== evalB.value) return evalA.value - evalB.value;
    for (let i = 0; i < evalA.highCards.length; i++) {
        if (evalA.highCards[i] !== evalB.highCards[i]) return evalA.highCards[i] - evalB.highCards[i];
    }
    return 0;
};

export const validateArrangement = (rows) => {
    if (!rows || rows.front?.length !== 3 || rows.middle?.length !== 5 || rows.back?.length !== 5) {
        return { isValid: false, message: '牌墩数量不正确' };
    }
    if (compareHands(rows.front, rows.middle) > 0) return { isValid: false, message: '头道大于中道' };
    if (compareHands(rows.middle, rows.back) > 0) return { isValid: false, message: '中道大于尾道' };
    return { isValid: true, message: '合规牌型' };
};

// --- AI Arrangement Logic ---

const combinations = (arr, k) => {
    if (k < 0 || k > arr.length) return [];
    if (k === 0) return [[]];
    if (k === arr.length) return [arr];
    const result = [];
    const recurse = (start, combo) => {
        if (combo.length === k) {
            result.push(combo);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            recurse(i + 1, [...combo, arr[i]]);
        }
    };
    recurse(0, []);
    return result;
};

// This is a simplified AI. A full implementation is too complex.
// It finds the first valid arrangement, which is better than nothing.
export const getAIThirteenGameBestArrangement = (hand) => {
    const sortedHand = sortThirteenGameCardsByRank(hand);
    
    // Fallback: simple sorted arrangement
    const fallbackArrangement = {
        front: sortedHand.slice(0, 3),
        middle: sortedHand.slice(3, 8),
        back: sortedHand.slice(8, 13)
    };

    // Attempt to find a valid arrangement by iterating through back hands
    const backCombinations = combinations(sortedHand, 5);

    for (const back of backCombinations) {
        const remainingForMiddle = sortedHand.filter(c => !back.includes(c));
        const middleCombinations = combinations(remainingForMiddle, 5);

        for (const middle of middleCombinations) {
            const front = remainingForMiddle.filter(c => !middle.includes(c));
            const currentArrangement = { front, middle, back };

            if (validateArrangement(currentArrangement).isValid) {
                // Found a valid arrangement, return it
                return currentArrangement;
            }
        }
    }

    // If no valid arrangement is found after trying, return the fallback
    console.warn("AI could not find a valid arrangement, returning default sorted split.");
    return fallbackArrangement;
};
