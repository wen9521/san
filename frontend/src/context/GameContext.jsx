import React, { createContext, useState, useContext } from 'react';
import { getAIBestArrangement, sortCardsByRank } from '../utils/thirteenLogic';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);

    const startGame = (allCards) => {
        if (allCards.length !== 52) return;

        const playerHands = [
            allCards.slice(0, 13),
            allCards.slice(13, 26),
            allCards.slice(26, 39),
            allCards.slice(39, 52),
        ];

        // 玩家的牌直接放入三道
        const playerInitialRows = {
            front: playerHands[0].slice(0, 3),
            middle: playerHands[0].slice(3, 8),
            back: playerHands[0].slice(8, 13),
        };
        
        const initialPlayers = [
            { id: 'player', name: '你', hand: playerHands[0], rows: playerInitialRows, isReady: false },
            { id: 'ai1', name: '小明', hand: playerHands[1], rows: getAIBestArrangement(playerHands[1]), isReady: true },
            { id: 'ai2', name: '小红', hand: playerHands[2], rows: getAIBestArrangement(playerHands[2]), isReady: true },
            { id: 'ai3', name: '小刚', hand: playerHands[3], rows: getAIBestArrangement(playerHands[3]), isReady: true },
        ];

        setPlayers(initialPlayers);
        setIsGameActive(true);
        setComparisonResult(null);
    };
    
    // 更新玩家的牌墩
    const updatePlayerRows = (newRows) => {
         setPlayers(prev => prev.map(p => 
            p.id === 'player' ? { ...p, rows: newRows } : p
        ));
    };

    // 智能分牌
    const autoArrangePlayerHand = () => {
        setPlayers(prev => {
            const player = prev.find(p => p.id === 'player');
            if (player) {
                const bestRows = getAIBestArrangement(player.hand);
                return prev.map(p => p.id === 'player' ? { ...p, rows: bestRows } : p);
            }
            return prev;
        });
    };

    const setPlayerReady = () => {
        setPlayers(prev => prev.map(p => 
            p.id === 'player' ? { ...p, isReady: true } : p
        ));
    };

    // ... (calculateResults 保持不变) ...

    const value = {
        players,
        isGameActive,
        comparisonResult,
        startGame,
        updatePlayerRows,
        autoArrangePlayerHand,
        setPlayerReady,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};