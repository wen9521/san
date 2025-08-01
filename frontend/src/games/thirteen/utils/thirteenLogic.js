
import { ranks, suits } from './deck';

export const handTypes = {
  HIGH_CARD: 'High Card',
  PAIR: 'Pair',
  TWO_PAIR: 'Two Pair',
  THREE_OF_A_KIND: 'Three of a Kind',
  STRAIGHT: 'Straight',
  FLUSH: 'Flush',
  FULL_HOUSE: 'Full House',
  FOUR_OF_A_KIND: 'Four of a Kind',
  STRAIGHT_FLUSH: 'Straight Flush',
  ROYAL_FLUSH: 'Royal Flush',
};

const rankValues = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14,
};

export const getRankValue = (card) => card && card.rank ? rankValues[card.rank] : -1;

export const sortCards = (cards) => {
    if (!Array.isArray(cards)) return [];
    return cards
        .filter(card => card && typeof card.rank === 'string' && typeof card.suit === 'string')
        .sort((a, b) => rankValues[a.rank] - rankValues[b.rank]);
};

export const getHandType = (hand) => {
  if (!hand || hand.length === 0) return { type: handTypes.HIGH_CARD, hand: [], rank: 1 };

  const sortedHand = sortCards([...hand]);
  if (sortedHand.length === 0) return { type: handTypes.HIGH_CARD, hand: [], rank: 1 };

  const handLength = sortedHand.length;
  const isFlush = sortedHand.every(card => card.suit === sortedHand[0].suit);
  
  const rankCounts = sortedHand.reduce((counts, card) => {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
    return counts;
  }, {});

  const counts = Object.values(rankCounts);
  const isFourOfAKind = counts.includes(4);
  const isThreeOfAKind = counts.includes(3);
  const pairs = counts.filter(count => count === 2).length;

  const isStraight = handLength === 5 && sortedHand.every((card, i) => {
    if (i === 0) return true;
    return getRankValue(sortedHand[i-1]) === getRankValue(card) - 1;
  });

  const isAceLowStraight = handLength === 5 && JSON.stringify(sortedHand.map(c => c.rank).sort()) === JSON.stringify(['2', '3', '4', '5', 'A'].sort());

  if (handLength === 5) {
    if (isStraight && isFlush && sortedHand[4].rank === 'A') return { type: handTypes.ROYAL_FLUSH, hand: sortedHand, rank: 10 };
    if ((isStraight || isAceLowStraight) && isFlush) return { type: handTypes.STRAIGHT_FLUSH, hand: sortedHand, rank: 9 };
    if (isFourOfAKind) return { type: handTypes.FOUR_OF_A_KIND, hand: sortedHand, rank: 8 };
    if (isThreeOfAKind && pairs === 1) return { type: handTypes.FULL_HOUSE, hand: sortedHand, rank: 7 };
    if (isFlush) return { type: handTypes.FLUSH, hand: sortedHand, rank: 6 };
    if (isStraight || isAceLowStraight) return { type: handTypes.STRAIGHT, hand: sortedHand, rank: 5 };
  }
  
  if (isThreeOfAKind) return { type: handTypes.THREE_OF_A_KIND, hand: sortedHand, rank: 4 };
  if (pairs === 2) return { type: handTypes.TWO_PAIR, hand: sortedHand, rank: 3 };
  if (pairs === 1) return { type: handTypes.PAIR, hand: sortedHand, rank: 2 };

  return { type: handTypes.HIGH_CARD, hand: sortedHand, rank: 1 };
};


export const compareHands = (handA, handB) => {
  const typeA = getHandType(handA);
  const typeB = getHandType(handB);

  if (typeA.rank !== typeB.rank) {
    return typeA.rank - typeB.rank;
  }

  const sortedA = sortCards([...handA]).reverse();
  const sortedB = sortCards([...handB]).reverse();

  for (let i = 0; i < sortedA.length; i++) {
    if (getRankValue(sortedA[i]) !== getRankValue(sortedB[i])) {
      return getRankValue(sortedA[i]) - getRankValue(sortedB[i]);
    }
  }

  return 0;
};

export const isValidHand = (hand, position) => {
    if (position === 'front' && hand.length !== 3) return false;
    if (position !== 'front' && hand.length !== 5) return false;
    return true;
};

export const isValidSetup = (front, middle, back) => {
  if (!isValidHand(front, 'front') || !isValidHand(middle, 'middle') || !isValidHand(back, 'back')) {
    return false;
  }
  
  const frontType = getHandType(front);
  const middleType = getHandType(middle);
  const backType = getHandType(back);
  
  if (!frontType || !middleType || !backType) return false;

  return compareHands(middle, front) > 0 && compareHands(back, middle) > 0;
};


function findStraight(cards) {
    if (cards.length < 5) return null;
    const sorted = sortCards([...cards]);
    if (sorted.length < 5) return null;

    for (let i = 0; i <= sorted.length - 5; i++) {
        const potentialHand = sorted.slice(i, i + 5);
        if (isStraight(potentialHand)) {
            return potentialHand;
        }
    }
    const aceLowRanks = ['2', '3', '4', '5', 'A'];
    const aceLowHand = sorted.filter(c => aceLowRanks.includes(c.rank));
    if (new Set(aceLowHand.map(c => c.rank)).size === 5) {
        return aceLowHand;
    }
    return null;
}

function findFlush(cards) {
    if (cards.length < 5) return null;
    const suits = {};
    cards.forEach(card => {
        if (!suits[card.suit]) suits[card.suit] = [];
        suits[card.suit].push(card);
    });
    for (const suit in suits) {
        if (suits[suit].length >= 5) {
            return suits[suit].slice(0, 5);
        }
    }
    return null;
}

function findFourOfAKind(cards) {
    if (cards.length < 4) return null;
    const ranks = {};
    cards.forEach(card => {
        if (!ranks[card.rank]) ranks[card.rank] = [];
        ranks[card.rank].push(card);
    });
    for (const rank in ranks) {
        if (ranks[rank].length === 4) {
            const four = ranks[rank];
            const remaining = cards.filter(c => c.rank !== rank);
            if (remaining.length === 0) return null; 
            const kicker = sortCards(remaining).reverse()[0];
            return [...four, kicker];
        }
    }
    return null;
}

function findFullHouse(cards) {
    if (cards.length < 5) return null;
    let three = null;
    let pair = null;

    const ranks = {};
    cards.forEach(card => {
        if (!ranks[card.rank]) ranks[card.rank] = [];
        ranks[card.rank].push(card);
    });

    const sortedRanks = Object.keys(ranks).sort((a, b) => rankValues[b] - rankValues[a]);

    for (const rank of sortedRanks) {
        if (ranks[rank].length >= 3 && !three) {
            three = ranks[rank].slice(0, 3);
            const remainingCards = cards.filter(c => !three.some(tc => tc.id === c.id));
            const remainingRanks = {};
            remainingCards.forEach(card => {
                if (!remainingRanks[card.rank]) remainingRanks[card.rank] = [];
                remainingRanks[card.rank].push(card);
            });
            const sortedRemainingRanks = Object.keys(remainingRanks).sort((a,b) => rankValues[b] - rankValues[a]);
            for(const p_rank of sortedRemainingRanks){
                if(remainingRanks[p_rank].length >= 2){
                    pair = remainingRanks[p_rank].slice(0,2);
                    return [...three, ...pair];
                }
            }
        }
    }
    return null;
}

function getCombinations(array, size) {
    const results = [];
    const filteredArray = array.filter(Boolean); // Ensure no undefined/null elements

    function helper(start, combination) {
        if (combination.length === size) {
            results.push([...combination]);
            return;
        }
        for (let i = start; i < filteredArray.length; i++) {
            combination.push(filteredArray[i]);
            helper(i + 1, combination);
            combination.pop();
        }
    }
    helper(0, []);
    return results;
}

export const findBestCombination = (cards) => {
    let bestSetup = null;
    let bestScore = -1;

    const fiveCardCombinations = getCombinations(cards, 5);

    for (const backHand of fiveCardCombinations) {
        const backType = getHandType(backHand);
        if (!backType) continue;

        const remainingAfterBack = cards.filter(c => !backHand.some(bh => bh.id === c.id));
        const middleCombinations = getCombinations(remainingAfterBack, 5);

        for (const middleHand of middleCombinations) {
            const middleType = getHandType(middleHand);
            if (!middleType) continue;

            const frontHand = remainingAfterBack.filter(c => !middleHand.some(mh => mh.id === c.id));
            
            if (isValidSetup(frontHand, middleHand, backHand)) {
                const frontType = getHandType(frontHand);
                if (!frontType) continue;

                const score = backType.rank * 100 + middleType.rank * 10 + frontType.rank;
                if (score > bestScore) {
                    bestScore = score;
                    bestSetup = {
                        front: frontHand,
                        middle: middleHand,
                        back: backHand
                    };
                }
            }
        }
    }
    
    if (!bestSetup) {
      console.warn("Could not find optimal 5-5-3 combination, using a simpler fallback.");
      const sorted = sortCards([...cards]).reverse();
      return {
        back: sorted.slice(0,5),
        middle: sorted.slice(5,10),
        front: sorted.slice(10,13)
      }
    }

    return bestSetup;
};
