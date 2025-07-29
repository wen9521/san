import React, { createContext, useState, useContext, useCallback } from 'react';
import { getAIEightBestArrangement, validateEightArrangement, sortCardsByRank } from '../utils/eightLogic'; // 引入八张逻辑

const EightGameContext = createContext();

export const useEightGame = () => useContext(EightGameContext);

// --- 模拟发牌，用于独立开发 ---
const dealCardsForEightGame = () => {
    const suits = ['spades', 'hearts', 'clubs', 'diamonds'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
    let deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            // 为卡片添加一个数值，方便排序和AI评估
            const value = ranks.indexOf(rank) + 2;
            deck.push({ id: `${rank}_of_${suit}`, suit, rank, value });
        }
    }
    deck = deck.sort(() => Math.random() - 0.5).slice(0, 48); // 洗牌并取48张

    // 发给6个玩家
    const hands = [];
    for(let i=0; i<6; i++) {
        hands.push(deck.slice(i * 8, (i + 1) * 8));
    }
    return hands;
};


export const EightGameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);

    const startGame = () => {
        const hands = dealCardsForEightGame();

        const playerInitialRows = {
            front: [],
            middle: sortCardsByRank(hands[0]), // 玩家的8张牌初始全在中道
            back: []
        };
        
        const initialPlayers = [
            { id: 'player', name: '你', hand: hands[0], rows: playerInitialRows, isReady: false },
        ];
        // 创建5个AI玩家
        for(let i=1; i<6; i++) {
            initialPlayers.push({
                id: `ai${i}`,
                name: `AI ${i}`,
                hand: hands[i],
                rows: getAIEightBestArrangement(hands[i]),
                isReady: true,
            });
        }

        setPlayers(initialPlayers);
        setIsGameActive(true);
        setComparisonResult(null);
    };

    const resetGame = useCallback(() => {
        setPlayers([]);
        setIsGameActive(false);
        setComparisonResult(null);
    }, []);
    
    const updatePlayerRows = (newRows) => {
         setPlayers(prev => prev.map(p => 
            p.id === 'player' ? { ...p, rows: newRows } : p
        ));
    };

    const autoArrangePlayerHand = () => {
        setPlayers(prev => {
            const player = prev.find(p => p.id === 'player');
            if (player) {
                return prev.map(p => p.id === 'player' ? { ...p, rows: getAIEightBestArrangement(player.hand), isReady: false } : p);
            }
            return prev;
        });
    };
    
    // ... 未来可以添加比牌计分等逻辑 ...

    const value = {
        players,
        isGameActive,
        comparisonResult,
        startGame,
        resetGame,
        updatePlayerRows,
        autoArrangePlayerHand,
    };

    return <EightGameContext.Provider value={value}>{children}</EightGameContext.Provider>;
};
