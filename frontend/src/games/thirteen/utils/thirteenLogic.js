import { getRankValue } from '../../../core/poker';
import { createDeck, shuffleDeck } from '../../../core/deck';

// --- Game-Specific Constants ---
export const HAND_TYPES = {
    FOUL: { value: 0, name: '倒水' },
    HIGH_CARD: { value: 1, name: '高牌' },
    PAIR: { value: 2, name: '对子' },
    TWO_PAIR: { value: 3, name: '两对' },
    THREE_OF_A_KIND: { value: 4, name: '三条' },
    STRAIGHT: { value: 5, name: '顺子' },
    FLUSH: { value: 6, name: '同花' },
    FULL_HOUSE: { value: 7, name: '葫芦' },
    FOUR_OF_A_KIND: { value: 8, name: '铁支' },
    STRAIGHT_FLUSH: { value: 9, name: '同花顺' },
    // Special hands are ranked higher than normal hands
    SPECIAL_DRAGON: { value: 15, name: '一条龙' },
};

// --- Card Dealing (Game-Specific) ---
export const dealThirteenCards = (numPlayers = 4) => {
    const deck = shuffleDeck(createDeck());
    const hands = Array.from({ length: numPlayers }, () => []);
    for (let i = 0; i < 13; i++) {
        for (let j = 0; j < numPlayers; j++) {
            if (deck.length > 0) {
                hands[j].push(deck.pop());
            }
        }
    }
    return hands;
};

// --- Core Evaluation Logic ---

const getHandEvaluation = (hand) => {
    if (!hand || hand.length === 0) return { type: HAND_TYPES.HIGH_CARD, ranks: [] };

    const sortedRanks = hand.map(c => getRankValue(c.rank)).sort((a, b) => b - a);
    const suits = hand.map(c => c.suit);
    const rankCounts = sortedRanks.reduce((acc, rank) => { (acc[rank] = (acc[rank] || 0) + 1); return acc; }, {});
    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    const isFlush = new Set(suits).size === 1;
    const isStraight = (() => {
        const uniqueRanks = Array.from(new Set(sortedRanks));
        if (uniqueRanks.length !== 5) return false;
        // Ace-low straight (A-2-3-4-5) is a special case
        if (JSON.stringify(uniqueRanks) === '[12,4,3,2,0]') return true;
        return uniqueRanks[0] - uniqueRanks[4] === 4;
    })();

    if (hand.length === 5) {
        if (isStraight && isFlush) return { type: HAND_TYPES.STRAIGHT_FLUSH, ranks: sortedRanks };
        if (counts[0] === 4) return { type: HAND_TYPES.FOUR_OF_A_KIND, ranks: sortedRanks };
        if (counts[0] === 3 && counts[1] === 2) return { type: HAND_TYPES.FULL_HOUSE, ranks: sortedRanks };
        if (isFlush) return { type: HAND_TYPES.FLUSH, ranks: sortedRanks };
        if (isStraight) return { type: HAND_TYPES.STRAIGHT, ranks: sortedRanks };
        if (counts[0] === 3) return { type: HAND_TYPES.THREE_OF_A_KIND, ranks: sortedRanks };
        if (counts[0] === 2 && counts[1] === 2) return { type: HAND_TYPES.TWO_PAIR, ranks: sortedRanks };
        if (counts[0] === 2) return { type: HAND_TYPES.PAIR, ranks: sortedRanks };
    }

    if (hand.length === 3) {
        if (counts[0] === 3) return { type: HAND_TYPES.THREE_OF_A_KIND, ranks: sortedRanks };
        if (counts[0] === 2) return { type: HAND_TYPES.PAIR, ranks: sortedRanks };
    }

    return { type: HAND_TYPES.HIGH_CARD, ranks: sortedRanks };
};

const compareEvaluations = (evalA, evalB) => {
    if (evalA.type.value !== evalB.type.value) {
        return evalA.type.value - evalB.type.value;
    }
    // Compare high cards if types are the same
    for (let i = 0; i < evalA.ranks.length; i++) {
        if (evalA.ranks[i] !== evalB.ranks[i]) {
            return evalA.ranks[i] - evalB.ranks[i];
        }
    }
    return 0; // Identical
};

// --- Public API for the Game ---

export const validateArrangement = (rows) => {
    if (!rows || !rows.front || !rows.middle || !rows.back) return false;
    if (rows.front.length !== 3 || rows.middle.length !== 5 || rows.back.length !== 5) return false;

    const frontEval = getHandEvaluation(rows.front);
    const middleEval = getHandEvaluation(rows.middle);
    const backEval = getHandEvaluation(rows.back);

    return compareEvaluations(frontEval, middleEval) <= 0 && compareEvaluations(middleEval, backEval) <= 0;
};

// A simplified AI arrangement logic. A real one is much more complex.
export const findBestArrangement = (fullHand) => {
    // This is a placeholder. A real implementation is highly complex.
    const sortedHand = fullHand.sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));
    return {
        front: sortedHand.slice(10, 13),
        middle: sortedHand.slice(5, 10),
        back: sortedHand.slice(0, 5),
    };
};

export const calculateScores = (players) => {
    const scores = players.reduce((acc, p) => ({ ...acc, [p.id]: 0 }), {});
    
    // Placeholder - in a real game, you compare each player to every other player
    // This is a simplified version for demonstration
    const player = players.find(p => p.id === 'player');
    const ai = players.find(p => p.id !== 'player');

    if (player && ai) {
        let roundScore = 0;
        const playerIsFoul = !validateArrangement(player.rows);
        const aiIsFoul = !validateArrangement(ai.rows);

        if(playerIsFoul && !aiIsFoul) roundScore = -6; // Player fouls, big loss
        else if (!playerIsFoul && aiIsFoul) roundScore = 6; // AI fouls, big win
        else if (!playerIsFoul && !aiIsFoul) {
             roundScore += compareEvaluations(getHandEvaluation(player.rows.front), getHandEvaluation(ai.rows.front)) > 0 ? 1 : -1;
             roundScore += compareEvaluations(getHandEvaluation(player.rows.middle), getHandEvaluation(ai.rows.middle)) > 0 ? 1 : -1;
             roundScore += compareEvaluations(getHandEvaluation(player.rows.back), getHandEvaluation(ai.rows.back)) > 0 ? 1 : -1;
        }
        
        scores[player.id] = roundScore;
        scores[ai.id] = -roundScore;
    }

    return scores;
};

export const getHandTypeName = (hand) => {
    return getHandEvaluation(hand).type.name;
};
