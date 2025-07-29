/**
 * 【核心修正】: 创建并返回一副标准的52张扑克牌对象数组。
 * @returns {Array<Object>} 一副扑克牌，每张牌的格式为 { id, rank, suit }。
 */
const createDeck = () => {
    const suits = ['spades', 'hearts', 'clubs', 'diamonds'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({
                id: `${rank}_of_${suit}`,
                rank: rank,
                suit: suit
            });
        }
    }
    return deck;
};

/**
 * 使用 Fisher-Yates (aka Knuth) 算法来洗牌。
 * @param {Array<Object>} deck - 需要被洗的牌组。
 * @returns {Array<Object>} 洗好的牌组。
 */
const shuffleDeck = (deck) => {
    let currentIndex = deck.length, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [deck[currentIndex], deck[randomIndex]] = [deck[randomIndex], deck[currentIndex]];
    }

    return deck;
};

/**
 * 创建、洗牌并发牌给四位玩家。
 * 现在返回的是对象数组。
 * @returns {{player: Array<Object>, ai1: Array<Object>, ai2: Array<Object>, ai3: Array<Object>}}
 */
export const dealAndShuffle = () => {
    const deck = createDeck();
    const shuffledDeck = shuffleDeck(deck);

    const player = shuffledDeck.slice(0, 13);
    const ai1 = shuffledDeck.slice(13, 26);
    const ai2 = shuffledDeck.slice(26, 39);
    const ai3 = shuffledDeck.slice(39, 52);

    return { player, ai1, ai2, ai3 };
};
