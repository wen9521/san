import React, { createContext, useState, useContext, useCallback } from 'react';
import { getAIBestArrangement, calculateAllScores, sortCardsByRank } from '../utils/thirteenLogic';
import { dealAndShuffle } from '../utils/deal'; // 【新增】引入前端发牌模块

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);

    // 内部函数，用于设置玩家数据和激活游戏
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
    
    // 用于【在线模式】的函数
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
    
    // 【新增】用于【离线试玩模式】的函数
    const startOfflineGame = useCallback(() => {
        const hands = dealAndShuffle(); // 调用前端发牌模块
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

    const setPlayerReady = () => {
        let updatedPlayers = [];
        setPlayers(prev => {
            updatedPlayers = prev.map(p => 
                p.id === 'player' ? { ...p, isReady: true } : p
            );
            return updatedPlayers;
        });
        return updatedPlayers;
    };
    
    const calculateResults = (currentPlayers) => {
        if (currentPlayers.every(p => p.isReady)) {
            const results = calculateAllScores(currentPlayers);
            setComparisonResult(results);
            return true;
        }
        return false;
    };

    // 【新增】补充 startComparison，供页面直接调用
    const startComparison = () => {
        // 1. 先把玩家标记为已准备
        let updatedPlayers = [];
        setPlayers(prev => {
            updatedPlayers = prev.map(p =>
                p.id === 'player' ? { ...p, isReady: true } : p
            );
            return updatedPlayers;
        });

        // 2. 立即用 updatedPlayers 计算，如果玩家已准备
        if (updatedPlayers.length && updatedPlayers.every(p => p.isReady)) {
            const success = calculateResults(updatedPlayers);
            if (success) {
                return { success: true };
            } else {
                return { success: false, message: "牌型不合法，请调整后再试。" };
            }律师
        } else {
            return { success: false, message: "无法进入比牌，请检查状态。" };
        }
    };

    const value = {
        players,
        isGameActive,
        comparisonResult,
        startOnlineGame, // 导出在线模式函数
        startOfflineGame, // 导出离线模式函数
        resetGame,
        updatePlayerRows,
        autoArrangePlayerHand,
        setPlayerReady,
        calculateResults,
        startComparison, // ← 补充导出
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
