// 基础数据定义
const SUITS = { spades: 4, hearts: 3, clubs: 2, diamonds: 1 };
const RANKS = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'jack': 11, 'queen': 12, 'king': 13, 'ace': 14 };

// 辅助函数：解析卡片
const parseCard = (card) => {
    // 【核心修正】: 能同时处理字符串和对象
    const cardId = typeof card === 'string' ? card : card.id;
    if(!cardId) return { rank: 0, suit: 0 };
    const parts = cardId.split('_of_');
    return { rank: RANKS[parts[0]], suit: SUITS[parts[1]] };
};

export const evaluateHand = (hand) => {
    if (!hand || hand.length === 0) return { type: '无效牌型', rank: 0, highCards: [] };

    const cards = hand.map(parseCard).sort((a, b) => b.rank - a.rank);
    const ranks = cards.map(c => c.rank);
    const suits = cards.map(c => c.suit);
    const highCards = ranks;

    const isFlush = new Set(suits).size === 1;
    const isStraight = ranks.every((rank, i) => i === 0 || ranks[i-1] - 1 === rank);
    const isWheel = JSON.stringify(ranks) === JSON.stringify([14, 5, 4, 3, 2]);
    if(isWheel) {
        highCards[0] = 1;
    }

    const rankCounts = ranks.reduce((acc, rank) => {
        acc[rank] = (acc[rank] || 0) + 1;
        return acc;
    }, {});
    const counts = Object.values(rankCounts).sort((a,b) => b - a);

    if (isStraight && isFlush) return { type: '同花顺', rank: 9, highCards };
    if (counts[0] === 4) return { type: '铁支', rank: 8, highCards };
    if (counts[0] === 3 && counts[1] === 2) return { type: '葫芦', rank: 7, highCards };
    if (isFlush) return { type: '同花', rank: 6, highCards };
    if (isStraight || isWheel) return { type: '顺子', rank: 5, highCards };
    if (counts[0] === 3) return { type: '三条', rank: 4, highCards };
    if (counts[0] === 2 && counts[1] === 2) return { type: '两对', rank: 3, highCards };
    if (counts[0] === 2) return { type: '一对', rank: 2, highCards };
    return { type: '乌龙', rank: 1, highCards };
};

export const compareHands = (handA, handB) => {
    if (handA.rank !== handB.rank) {
        return handA.rank - handB.rank;
    }
    for (let i = 0; i < handA.highCards.length; i++) {
        if (handA.highCards[i] !== handB.highCards[i]) {
            return handA.highCards[i] - handB.highCards[i];
        }
    }
    return 0;
};

export const validateArrangement = (rows) => {
    const { front, middle, back } = rows;
    if (front.length !== 3 || middle.length !== 5 || back.length !== 5) {
        return { isValid: false, message: '牌墩数量错误！请确保牌墩数量为 头道:3, 中道:5, 后道:5。' };
    }

    const frontHand = evaluateHand(front);
    const middleHand = evaluateHand(middle);
    const backHand = evaluateHand(back);
    
    if (compareHands(frontHand, middleHand) > 0) return { isValid: false, message: '头道牌型大于中道，不符合规则！' };
    if (compareHands(middleHand, backHand) > 0) return { isValid: false, message: '中道牌型大于后道，不符合规则！' };

    return { isValid: true, message: '牌型合法' };
};

export const getAIBestArrangement = (hand) => {
    const sortedHand = hand.sort((a, b) => (RANKS[a.rank] || 0) - (RANKS[b.rank] || 0));
    
    return {
        front: sortedHand.slice(0, 3),
        middle: sortedHand.slice(3, 8),
        back: sortedHand.slice(8, 13),
    };
};

export const calculateAllScores = (players) => {
    return { scores: [], details: [] };
};

export const sortCardsByRank = (cards) => {
    return cards.sort((a, b) => (RANKS[a.rank] || 0) - (RANKS[b.rank] || 0));
};

export const findCardInRows = (rows, cardId) => {
    for (const row in rows) {
        const card = rows[row].find(c => c.id === cardId);
        if (card) return card;
    }
    return null;
};
