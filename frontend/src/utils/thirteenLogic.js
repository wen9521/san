/**
 * sssScore.final.simplified.js - 十三水最终版比牌计分器 (极简规则)
 * Adapted for the project's data structure (card objects).
 */

const VALUE_ORDER = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  '10': 10, 'jack': 11, 'queen': 12, 'king': 13, 'ace': 14
};
const SUIT_ORDER = { spades: 4, hearts: 3, clubs: 2, diamonds: 1 };

const SCORES = {
  FRONT: { '三条': 3 },
  MIDDLE: { '铁支': 8, '同花顺': 10, '葫芦': 2 },
  BACK: { '铁支': 4, '同花顺': 5 },
  SPECIAL: { '一条龙': 13, '三同花': 4, '三顺子': 4, '六对半': 3 },
};

// Main function to be called by the GameContext
export function calculateAllScores(players) {
  const N = players.length;
  if (N < 2) return { scores: new Array(N).fill(0), details: [] };

  let marks = new Array(N).fill(0);
  const playerInfos = players.map(p => {
    const foul = isFoul(p.rows.front, p.rows.middle, p.rows.back);
    const specialType = foul ? null : getSpecialType(p.rows);
    return { ...p, isFoul: foul, specialType };
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
        const areas = ['front', 'middle', 'back'];
        for (const area of areas) {
          const cmp = compareArea(p1.rows[area], p2.rows[area], area);
          if (cmp > 0) pairScore += getAreaScore(p1.rows[area], area);
          else if (cmp < 0) pairScore -= getAreaScore(p2.rows[area], area);
        }
      }
      marks[i] += pairScore;
      marks[j] -= pairScore;
    }
  }
  
  const detailedScores = players.map((p, index) => ({
      playerId: p.id,
      totalScore: marks[index],
      front: evaluateHand(p.rows.front, 'front'),
      middle: evaluateHand(p.rows.middle, 'middle'),
      back: evaluateHand(p.rows.back, 'back'),
  }));

  return { scores: detailedScores, details: [] };
}

function calculateTotalBaseScore(p) {
  if (p.specialType) return SCORES.SPECIAL[p.specialType] || 0;
  return getAreaScore(p.rows.front, 'front') + getAreaScore(p.rows.middle, 'middle') + getAreaScore(p.rows.back, 'back');
}

export function isFoul(front, middle, back) {
  const frontRank = areaTypeRank(evaluateHand(front, 'front').type, 'front');
  const midRank = areaTypeRank(evaluateHand(middle, 'middle').type, 'middle');
  const backRank = areaTypeRank(evaluateHand(back, 'back').type, 'back');
  if (frontRank > midRank || midRank > backRank) return true;
  if (frontRank === midRank && compareArea(front, middle, 'front') > 0) return true;
  if (midRank === backRank && compareArea(middle, back, 'middle') > 0) return true;
  return false;
}

export function evaluateHand(cards, area = 'middle') {
    if (!cards || cards.length === 0) return { type: '无效牌型', rank: 0 };
    const type = getAreaType(cards, area);
    const rank = areaTypeRank(type, area);
    return { type, rank };
}

function getAreaType(cards, area) {
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
  if (area === 'front') {
    if (type === "三条") return 4;
    if (type === "对子") return 2;
    return 1;
  }
  const rankMap = { "同花顺": 9, "铁支": 8, "葫芦": 7, "同花": 6, "顺子": 5, "三条": 4, "两对": 3, "对子": 2, "高牌": 1 };
  return rankMap[type] || 1;
}

function getAreaScore(cards, area) {
  const type = getAreaType(cards, area);
  const areaUpper = area.toUpperCase();
  return SCORES[areaUpper]?.[type] || 1;
}

function getGroupedValues(cards) {
  const counts = {};
  cards.forEach(card => {
    const val = VALUE_ORDER[card.rank];
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
  if (cards.length < 3) return false;
  let vals = [...new Set(cards.map(c => VALUE_ORDER[c.rank]))].sort((a, b) => a - b);
  if (vals.length !== cards.length) return false;
  const isA2345 = JSON.stringify(vals) === JSON.stringify([2, 3, 4, 5, 14]);
  if(isA2345 && cards.length === 5) return true;
  const isNormalStraight = (vals[vals.length - 1] - vals[0] === cards.length - 1);
  return isNormalStraight;
}

function isFlush(cards) {
  if (!cards || cards.length === 0) return false;
  const firstSuit = cards[0].suit;
  return cards.every(c => c.suit === firstSuit);
}

export function compareArea(a, b, area) {
  const typeA = getAreaType(a, area);
  const typeB = getAreaType(b, area);
  const rankA = areaTypeRank(typeA, area);
  const rankB = areaTypeRank(typeB, area);
  if (rankA !== rankB) return rankA - rankB;

  if (typeA === '同花顺' || typeA === '同花') {
    const suitA = SUIT_ORDER[a[0].suit];
    const suitB = SUIT_ORDER[b[0].suit];
    if (suitA !== suitB) return suitA - suitB;
    
    const all = [...a, ...b];
    let maxCard = all[0];
    for (const c of all) {
      if (VALUE_ORDER[c.rank] > VALUE_ORDER[maxCard.rank] || 
         (VALUE_ORDER[c.rank] === VALUE_ORDER[maxCard.rank] && SUIT_ORDER[c.suit] > SUIT_ORDER[maxCard.suit]))
        maxCard = c;
    }
    if (a.includes(maxCard)) return 1;
    if (b.includes(maxCard)) return -1;
    return 0;
  }
  
  // Fallback to simpler comparison for other types
  const sortedA = sortCards(a);
  const sortedB = sortCards(b);
  for (let i = 0; i < sortedA.length; i++) {
      if (sortedA[i].value !== sortedB[i].value) return sortedA[i].value - sortedB[i].value;
  }
  return 0;
}

function sortCards(cards) {
  return cards.map(card => {
    return { ...card, value: VALUE_ORDER[card.rank], suitValue: SUIT_ORDER[card.suit] };
  }).sort((a, b) => b.value - a.value || b.suitValue - a.suitValue);
}

function getSpecialType(rows) {
  const all = [...rows.front, ...rows.middle, ...rows.back];
  const midType = getAreaType(rows.middle, 'middle');
  const backType = getAreaType(rows.back, 'back');
  if (['铁支', '同花顺'].includes(midType) || ['铁支', '同花顺'].includes(backType)) return null;

  const uniqVals = new Set(all.map(c => c.rank));
  if (uniqVals.size === 13) return '一条龙';
  
  const groupedAll = getGroupedValues(all);
  if (groupedAll['2']?.length === 6) return '六对半';

  if (isFlush(rows.front) && isFlush(rows.middle) && isFlush(rows.back)) return '三同花';
  if (isStraight(rows.front) && isStraight(rows.middle) && isStraight(rows.back)) return '三顺子';
  
  return null;
}

// Keep other utility functions from the original file
export const getAIBestArrangement = (hand) => {
    const sortedHand = hand.sort((a, b) => (VALUE_ORDER[a.rank] || 0) - (VALUE_ORDER[b.rank] || 0));
    return {
        front: sortedHand.slice(0, 3),
        middle: sortedHand.slice(3, 8),
        back: sortedHand.slice(8, 13),
    };
};

export const sortCardsByRank = (cards) => {
    return cards.sort((a, b) => (VALUE_ORDER[a.rank] || 0) - (VALUE_ORDER[b.rank] || 0));
};

export const findCardInRows = (rows, cardId) => {
    for (const row in rows) {
        const card = rows[row].find(c => c.id === cardId);
        if (card) return card;
    }
    return null;
};

export const validateArrangement = (rows) => {
    const { front, middle, back } = rows;
    if (front.length !== 3 || middle.length !== 5 || back.length !== 5) {
        return { isValid: false, message: '牌墩数量错误！' };
    }
    if (isFoul(front, middle, back)) {
        return { isValid: false, message: '牌型不合法（倒水）！' };
    }
    return { isValid: true, message: '牌型合法' };
};
