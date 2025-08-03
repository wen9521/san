const VALUE_ORDER = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'jack': 11, 'queen': 12, 'king': 13, 'ace': 14
};
const SUIT_ORDER = { spades: 4, hearts: 3, clubs: 2, diamonds: 1 };

const SCORES = {
  HEAD: { '三条': 3 },
  MIDDLE: { '铁支': 8, '同花顺': 10, '葫芦': 2 },
  TAIL: { '铁支': 4, '同花顺': 5 },
  SPECIAL: { '一条龙': 13, '三同花': 4, '三顺子': 4, '六对半': 3 },
};

export function calcSSSAllScores(players) {
  const N = players.length;
  if (N < 2) return { scores: new Array(N).fill(0), details: [] };

  let marks = new Array(N).fill(0);
  const playerInfos = players.map(p => {
    const foul = isFoul(p.rows.head, p.rows.middle, p.rows.tail);
    const specialType = foul ? null : getSpecialType(p.rows);
    return { 
        ...p, 
        isFoul: foul, 
        specialType, 
        head: p.rows.head, 
        middle: p.rows.middle, 
        tail: p.rows.tail 
    };
  });

  for (let i = 0; i < N; ++i) {
    for (let j = i + 1; j < N; ++j) {
      const p1 = playerInfos[i];
      const p2 = playerInfos[j];
      let pairScore = 0;
      if (p1.isFoul && !p2.isFoul) pairScore = -calculateTotalBaseScore(p2);
      else if (!p1.isFoul && p2.isFoul) pairScore = calculateTotalBaseScore(p1);
      else if (p1.isFoul && p2.isFoul) pairScore = 0;
      else if (p1.specialType && p2.specialType) pairScore = 0;
      else if (p1.specialType && !p2.specialType) pairScore = SCORES.SPECIAL[p1.specialType] || 0;
      else if (!p1.specialType && p2.specialType) pairScore = -(SCORES.SPECIAL[p2.specialType] || 0);
      else {
        const areas = ['head', 'middle', 'tail'];
        for (const area of areas) {
          const cmp = compareArea(p1[area], p2[area], area);
          if (cmp > 0) pairScore += getAreaScore(p1[area], area);
          else if (cmp < 0) pairScore -= getAreaScore(p2[area], area);
        }
      }
      marks[i] += pairScore;
      marks[j] -= pairScore;
    }
  }
  
  const finalScores = {};
  playerInfos.forEach((p, index) => {
    finalScores[p.id] = marks[index];
  });

  return { scores: finalScores, details: playerInfos };
}

function calculateTotalBaseScore(p) {
  if (p.specialType) return SCORES.SPECIAL[p.specialType] || 0;
  return getAreaScore(p.head, 'head') + getAreaScore(p.middle, 'middle') + getAreaScore(p.tail, 'tail');
}

export function isFoul(head, middle, tail) {
  if(!head || !middle || !tail || head.length !== 3 || middle.length !== 5 || tail.length !== 5) return true;
  const headRank = areaTypeRank(getAreaType(head, 'head'), 'head');
  const midRank = areaTypeRank(getAreaType(middle, 'middle'), 'middle');
  const tailRank = areaTypeRank(getAreaType(tail, 'tail'), 'tail');
  if (headRank > midRank || midRank > tailRank) return true;
  if (headRank === midRank && compareArea(head, middle, 'head') > 0) return true;
  if (midRank === tailRank && compareArea(middle, tail, 'middle') > 0) return true;
  return false;
}

export function getAreaType(cards, area) {
  if (!cards || cards.length === 0) return "高牌";
  const grouped = getGroupedValues(cards);
  const isF = isFlush(cards);
  const isS = isStraight(cards);

  if (cards.length === 3) {
    if (grouped[3]) return "三条";
    if (grouped[2]) return "对子";
    return "高牌";
  }
  if (isF && isS) return "同花顺";
  if (grouped[4]) return "铁支";
  if (grouped[3] && grouped[2]) return "葫芦";
  if (isF) return "同花";
  if (isS) return "顺子";
  if (grouped[3]) return "三条";
  if (grouped[2]?.length === 2) return "两对";
  if (grouped[2]) return "对子";
  return "高牌";
}

function areaTypeRank(type, area) {
  if (area === 'head') {
    if (type === "三条") return 4;
    if (type === "对子") return 2;
    return 1;
  }
  if (type === "同花顺") return 9;
  if (type === "铁支") return 8;
  if (type === "葫芦") return 7;
  if (type === "同花") return 6;
  if (type === "顺子") return 5;
  if (type === "三条") return 4;
  if (type === "两对") return 3;
  if (type === "对子") return 2;
  return 1;
}

function getAreaScore(cards, area) {
  const type = getAreaType(cards, area);
  const areaUpper = area.toUpperCase();
  return SCORES[areaUpper]?.[type] || 1;
}

function getGroupedValues(cards) {
  const counts = {};
  cards.forEach(card => {
    const val = VALUE_ORDER[card.split('_')[0]];
    counts[val] = (counts[val] || 0) + 1;
  });
  const groups = {};
  for (const val in counts) {
    const count = counts[val];
    if (!groups[count]) groups[count] = [];
    groups[count].push(Number(val));
  }
  for (const count in groups) {
    groups[count].sort((a, b) => b - a);
  }
  return groups;
}

function isStraight(cards) {
    if (!cards || cards.length < 3) return false;
    let vals = [...new Set(cards.map(c => VALUE_ORDER[c.split('_')[0]]))].sort((a, b) => a - b);
    if (vals.length !== cards.length) return false;
    const isA2345 = JSON.stringify(vals) === JSON.stringify([2, 3, 4, 5, 14]);
    if (isA2345 && cards.length === 5) return true;
    return vals[vals.length - 1] - vals[0] === cards.length - 1;
}

function isFlush(cards) {
  if (!cards || cards.length === 0) return false;
  const firstSuit = cards[0].split('_')[2];
  return cards.every(c => c.split('_')[2] === firstSuit);
}

function compareArea(a, b, area) {
  const typeA = getAreaType(a, area);
  const typeB = getAreaType(b, area);
  const rankA = areaTypeRank(typeA, area);
  const rankB = areaTypeRank(typeB, area);
  if (rankA !== rankB) return rankA - rankB;

  if ((typeA === '同花顺') || (typeA === '同花')) {
    const suitA = SUIT_ORDER[a[0].split('_')[2]];
    const suitB = SUIT_ORDER[b[0].split('_')[2]];
    if (suitA !== suitB) return suitA - suitB;
  }
  
  const sortedA = sortCards(a);
  const sortedB = sortCards(b);

  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i].value !== sortedB[i].value) return sortedA[i].value - sortedB[i].value;
  }
  return 0;
}

function sortCards(cards) {
  return cards.map(cardStr => {
    const [value, , suit] = cardStr.split('_');
    return { value: VALUE_ORDER[value], suit: SUIT_ORDER[suit], id: cardStr };
  }).sort((a, b) => b.value - a.value || b.suit - a.suit);
}

function getSpecialType(rows) {
  const { head, middle, tail } = rows;
  const midType = getAreaType(middle, 'middle');
  const tailType = getAreaType(tail, 'tail');
  if (['铁支', '同花顺'].includes(midType) || ['铁支', '同花顺'].includes(tailType)) return null;
  const all = [...head, ...middle, ...tail];
  const uniqVals = new Set(all.map(c => c.split('_')[0]));
  if (uniqVals.size === 13) return '一条龙';
  const groupedAll = getGroupedValues(all);
  if (groupedAll['2']?.length === 6 && !groupedAll['1'] && !groupedAll['3'] && !groupedAll['4']) return '六对半';
  if (isFlush(head) && isFlush(middle) && isFlush(tail)) return '三同花';
  if (isStraight(head) && isStraight(middle) && isStraight(tail)) return '三顺子';
  return null;
}

// AI Helper for finding a valid hand arrangement
function getCombinations(array, size) {
    const results = [];
    if (!array) return results;
    function helper(start, combination) {
        if (combination.length === size) {
            results.push([...combination]);
            return;
        }
        for (let i = start; i < array.length; i++) {
            combination.push(array[i]);
            helper(i + 1, combination);
            combination.pop();
        }
    }
    helper(0, []);
    return results;
}

export const findBestCombination = (cards) => {
    const fiveCardCombinations = getCombinations(cards, 5);

    for (const backHand of fiveCardCombinations) {
        const remainingAfterBack = cards.filter(c => !backHand.includes(c));
        const middleCombinations = getCombinations(remainingAfterBack, 5);

        for (const middleHand of middleCombinations) {
            const frontHand = remainingAfterBack.filter(c => !middleHand.includes(c));
            
            if (!isFoul(frontHand, middleHand, backHand)) {
                return {
                    front: frontHand,
                    middle: middleHand,
                    back: backHand
                };
            }
        }
    }
    
    console.warn("Could not find a valid 5-5-3 combination, using a simple sort.");
    const sorted = cards.sort((a,b) => VALUE_ORDER[b.split('_')[0]] - VALUE_ORDER[a.split('_')[0]]);
    return {
      back: sorted.slice(0,5),
      middle: sorted.slice(5,10),
      front: sorted.slice(10,13)
    }
};

export const validateArrangement = (rows) => {
    const { front, middle, back } = rows;
    if (isFoul(front, middle, back)) {
        return { isValid: false, message: '牌型不合法 (倒水)' };
    }
    return { isValid: true };
}
