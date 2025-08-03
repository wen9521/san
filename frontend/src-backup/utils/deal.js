/**
 * 发牌和洗牌的核心逻辑
 */

// 定义牌的常量
const SUITS = ['S', 'H', 'C', 'D']; // 黑桃, 红桃, 梅花, 方块
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

// 英文名称映射，用于生成牌的ID和图片路径
const SUIT_NAMES = { S: 'spades', H: 'hearts', C: 'clubs', D: 'diamonds' };
const RANK_NAMES = {
    'A': 'ace', 'K': 'king', 'Q': 'queen', 'J': 'jack',
    'T': '10', '9': '9', '8': '8', '7': '7', '6': '6',
    '5': '5', '4': '4', '3': '3', '2': '2'
};


/**
 * 创建并返回一副完整的、带有ID的扑克牌
 * @returns {Array<Object>} 包含52张牌的数组，每张牌都是一个对象 e.g. { id: 'ace_of_spades', rank: 'A', suit: 'S' }
 */
function createDeck() {
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            const rankName = RANK_NAMES[rank];
            const suitName = SUIT_NAMES[suit];
            deck.push({
                // 【已修复】增加了这个关键的id字段
                id: `${rankName}_of_${suitName}`, 
                rank,
                suit
            });
        }
    }
    return deck;
}


/**
 * 洗牌并发给四位玩家，每人13张
 * @returns {{player: Array, ai1: Array, ai2: Array, ai3: Array}}
 */
export function dealAndShuffle() {
    let deck = createDeck();
    deck = deck.sort(() => Math.random() - 0.5); // 洗牌

    return {
        player: deck.slice(0, 13),
        ai1: deck.slice(13, 26),
        ai2: deck.slice(26, 39),
        ai3: deck.slice(39, 52),
    };
}
