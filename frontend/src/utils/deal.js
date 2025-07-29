/**
 * 创建并返回一副标准的52张扑克牌。
 * @returns {Array<string>} 一副扑克牌，每张牌的格式为 'rank_of_suit'。
 */
const createDeck = () => {
    const suits = ['spades', 'hearts', 'clubs', 'diamonds'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
    const deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push(`${rank}_of_${suit}`);
        }
    }
    return deck;
};

/**
 * 使用 Fisher-Yates (aka Knuth) 算法来洗牌。
 * @param {Array<string>} deck - 需要被洗的牌组。
 * @returns {Array<string>} 洗好的牌组。
 */
const shuffleDeck = (deck) => {
    let currentIndex = deck.length, randomIndex;

    // 当还剩有元素待洗牌时
    while (currentIndex !== 0) {
        // 随机挑选一个剩余元素
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // 并与当前元素交换
        [deck[currentIndex], deck[randomIndex]] = [deck[randomIndex], deck[currentIndex]];
    }

    return deck;
};

/**
 * 创建、洗牌并发牌给四位玩家。
 * 这是用于离线试玩模式的核心函数。
 * @returns {{player: Array<string>, ai1: Array<string>, ai2: Array<string>, ai3: Array<string>}}
 * 一个包含四位玩家手牌的对象。
 */
export const dealAndShuffle = () => {
    const deck = createDeck();
    const shuffledDeck = shuffleDeck(deck);

    // 将打乱的牌发给四位玩家
    const player = shuffledDeck.slice(0, 13);
    const ai1 = shuffledDeck.slice(13, 26);
    const ai2 = shuffledDeck.slice(26, 39);
    const ai3 = shuffledDeck.slice(39, 52);

    return { player, ai1, ai2, ai3 };
};
