import React, { createContext, useState, useContext } from 'react';
import { getAIBestArrangement, calculateAllScores } from '../utils/thirteenLogic';

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
            allCards.slice(0, 13),  // Player 1 (You)
            allCards.slice(13, 26), // AI 1
            allCards.slice(26, 39), // AI 2
            allCards.slice(39, 52), // AI 3
        ];
        
        const initialPlayers = [
            { id: 'player', name: '你', hand: playerHands[0], rows: null, isReady: false },
            { id: 'ai1', name: '电脑 1', hand: playerHands[1], rows: getAIBestArrangement(playerHands[1]), isReady: true },
            { id: 'ai2', name: '电脑 2', hand: playerHands[2], rows: getAIBestArrangement(playerHands[2]), isReady: true },
            { id: 'ai3', name: '电脑 3', hand: playerHands[3], rows: getAIBestArrangement(playerHands[3]), isReady: true },
        ];

        setPlayers(initialPlayers);
        setIsGameActive(true);
        setComparisonResult(null);
    };

    const setPlayerReady = (playerRows) => {
        setPlayers(prev => prev.map(p => 
            p.id === 'player' ? { ...p, rows: playerRows, isReady: true } : p
        ));
    };
    
    const calculateResults = () => {
        if (players.every(p => p.isReady)) {
            const results = calculateAllScores(players);
            setComparisonResult(results);
            return true; // 表示计算成功
        }
        return false;
    };

    const value = {
        players,
        isGameActive,
        comparisonResult,
        startGame,
        setPlayerReady,
        calculateResults,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};