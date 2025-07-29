import { evaluateHand, compareHands as compareEvaluatedHands } from './thirteenLogic'; // 复用十三张的核心牌型评估和比较

/**
 * 验证八张牌的牌型是否合法 (2-3-3)
 * @param {object} rows - 包含 front, middle, back 三个牌墩的对象
 * @returns {{isValid: boolean, message: string}} 验证结果
 */
export const validateEightArrangement = (rows) => {
    const { front, middle, back } = rows;

    // 1. 检查数量是否正确
    if (front.length !== 2 || middle.length !== 3 || back.length !== 3) {
        return { isValid: false, message: `牌墩数量错误！请确保牌墩数量为 头道:2, 中道:3, 后道:3。` };
    }

    // 2. 评估每个牌墩的牌力
    const frontHand = evaluateHand(front);
    const middleHand = evaluateHand(middle);
    const backHand = evaluateHand(back);
    
    // 3. 比较牌力 (头道 < 中道 < 后道)
    if (compareEvaluatedHands(frontHand, middleHand) > 0) {
        return { isValid: false, message: '头道牌型大于中道，不符合规则！' };
    }
    if (compareEvaluatedHands(middleHand, backHand) > 0) {
        return { isValid: false, message: '中道牌型大于后道，不符合规则！' };
    }

    return { isValid: true, message: '牌型合法' };
};


/**
 * 为AI找到八张牌的最佳排列方式 (待实现)
 * 目前的实现方式是简单地按牌力排序后分配
 * @param {Array<Object>} hand - 8张牌
 * @returns {{front: Array, middle: Array, back: Array}} - 返回一个基础的排列
 */
export const getAIEightBestArrangement = (hand) => {
    // 这是一个简化的实现，仅用于占位。后续可以实现更复杂的AI逻辑。
    const sortedHand = hand.sort((a, b) => b.value - a.value); // 按牌力从大到小排序

    // 简单的分配策略
    const back = sortedHand.slice(0, 3);
    const middle = sortedHand.slice(3, 6);
    const front = sortedHand.slice(6, 8);

    // 理想情况下，这里需要一个复杂的算法来确保 front < middle < back
    // 但对于AI，我们可以假设它总是合法的
    return { front, middle, back };
};

// 从十三张逻辑中直接复用这些函数，因为它们是通用的
export {
    sortCardsByRank,
    findCardInRows,
    evaluateHand,
    compareHands
} from './thirteenLogic';
