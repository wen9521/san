import React, { createContext, useState, useContext, useCallback } from 'react';
import { getAIBestArrangement, calculateAllScores, sortCardsByRank, validateArrangement } from '../utils/thirteenLogic'; // 引入 validateArrangement
import { dealAndShuffle } from '../utils/deal';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);

    const setupGame = (playerHand, ai1Hand, ai2Hand, ai3Hand) => {
        const initialPlayers = [
            { id: 'player', name: '你', hand: playerHand, rows: getAIBestArrangement(playerHand), isReady: false },
            { id: 'ai1', name: '小明', hand: ai1Hand, rows: getAIBestArrangement(ai1Hand), isReady: true },
            { id: 'ai2', name: '小红', hand: ai2Hand, rows: getAIBestArrangement(ai2Hand), isReady: true },
            { id: 'ai3', name: '小刚', hand: ai3Hand, rows: getAIBestArrangement(ai3Hand), isReady: true },
        ];
        setPlayers(initialPlayers);
        setIsGameActive(true);
        setComparisonResult(null);
    };
    
    const startOnlineGame = (allCards) => {
        if (allCards && allCards.length === 52) {
            const hands = {
                player: allCards.slice(0, 13),
                ai1: allCards.slice(13, 26),
                ai2: allCards.slice(26, 39),
                ai3: allCards.slice(39, 52),
            };
            setupGame(hands.player, hands.ai1, hands.ai2, hands.ai3);
        }
    };
    
    const startOfflineGame = useCallback(() => {
        const hands = dealAndShuffle();
        setupGame(hands.player, hands.ai1, hands.ai2, hands.ai3);
    }, []);

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
                const bestRows = getAIBestArrangement(player.hand);
                return prev.map(p => p.id === 'player' ? { ...p, rows: bestRows, isReady: false } : p);
            }
            return prev;
        });
    };

    // 【核心重构】: 创建一个统一的函数来处理比牌逻辑
    const startComparison = () => {
        const player = players.find(p => p.id === 'player');
        if (!player) return { success: false, message: "找不到玩家数据" };

        const validation = validateArrangement(player.rows);
        if (!validation.isValid) {
            // alert(validation.message); // 让页面组件来处理提示
            return { success: false, message: validation.message };
        }

        // 1. 基于当前状态，计算出下一个 players 状态
        const updatedPlayers = players.map(p => 
            p.id === 'player' ? { ...p, isReady: true } : p
        );

        // 2. 使用这个确定的新状态来计算结果
        const results = calculateAllScores(updatedPlayers);
        
        // 3. 一次性或连续地更新所有相关的状态
        setPlayers(updatedPlayers);
        setComparisonResult(results);

        // 4. 返回成功信号
        return { success: true };
    };
    
    const value = {
        players,
        isGameActive,
        comparisonResult,
        startOnlineGame,
        startOfflineGame,
        resetGame,
        updatePlayerRows,
        autoArrangePlayerHand,
        startComparison, // 【核心重构】: 导出新函数
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
