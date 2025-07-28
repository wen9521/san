import React, { createContext, useState, useContext } from 'react';
import { getAIBestArrangement, calculateAllScores, sortCardsByRank } from '../utils/thirteenLogic';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);

    const startGame = (allCards) => {
        if (allCards.length !== 52) {
            console.error("需要52张牌来开始四人游戏");
            return;
        }

        const playerHands = [
            allCards.slice(0, 13),
            allCards.slice(13, 26),
            allCards.slice(26, 39),
            allCards.slice(39, 52),
        ];

        const playerInitialRows = {
            front: sortCardsByRank(playerHands[0].slice(0, 3)),
            middle: sortCardsByRank(playerHands[0].slice(3, 8)),
            back: sortCardsByRank(playerHands[0].slice(8, 13)),
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
    
    const updatePlayerRows = (newRows) => {
         setPlayers(prev => prev.map(p => 
            p.id === 'player' ? { ...p, rows: newRows } : p
        ));
    };

    const autoArrangePlayerHand = () => {
        setPlayers(prev => {
            const player = prev.find(p => p.id === 'player');
            if (player) {
                const bestRows = getAIBestArrangement(player.hand);
                // 确保智能分牌后取消玩家的准备状态，因为牌已变动
                return prev.map(p => p.id === 'player' ? { ...p, rows: bestRows, isReady: false } : p);
            }
            return prev;
        });
    };

    // setPlayerReady现在返回更新后的players数组
    const setPlayerReady = () => {
        let updatedPlayers = [];
        setPlayers(prev => {
            updatedPlayers = prev.map(p => 
                p.id === 'player' ? { ...p, isReady: true } : p
            );
            return updatedPlayers;
        });
        return updatedPlayers; // 返回值，用于同步计算
    };
    
    // calculateResults现在接收players作为参数，避免异步问题
    const calculateResults = (currentPlayers) => {
        if (currentPlayers.every(p => p.isReady)) {
            const results = calculateAllScores(currentPlayers);
            setComparisonResult(results); // 更新全局状态
            return true;
        }
        return false;
    };

    const value = {
        players,
        isGameActive,
        comparisonResult,
        startGame,
        updatePlayerRows,
        autoArrangePlayerHand,
        setPlayerReady,
        calculateResults,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
