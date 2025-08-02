// 统一导出的全牌常量与查找工具（十三张/八张通用）

// 花色英文全称，注意顺序与图片命名一致
export const SUITS = ['spades', 'hearts', 'clubs', 'diamonds'];
// 点数英文全称，注意顺序与图片命名一致
export const RANKS = [
  '2', '3', '4', '5', '6', '7', '8', '9', '10',
  'jack', 'queen', 'king', 'ace'
];

// 牌对象列表，id 对应 svg 文件名，例如 'ace_of_spades'
export const FULL_DECK = (() => {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${rank}_of_${suit}`,
        rank,
        suit
      });
    }
  }
  return deck;
})();

// 根据 id 查找完整牌对象
export function getCardObjectById(id) {
  return FULL_DECK.find(card => card.id === id) || null;
}

// 可选：生成一副新牌的副本
export function createDeck() {
  return [...FULL_DECK];
}
