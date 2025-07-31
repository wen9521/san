import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import { getAIThirteenBestArrangement, validateThirteenArrangement } from '../utils/thirteenLogic';
import { dealAndShuffle } from '../utils/deal';
import DutouDialog from '../components/DutouDialog';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const calculateAllScores = (players) => {
    console.log("Calculating scores for players:", players);
    // Placeholder for actual scoring logic
    return { details: "Scores calculated successfully." };
};

export const GameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [isDutouDialogOpen, setDutouDialogOpen] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [dutouCurrent, setDutouCurrent] = useState({});
    const [dutouHistory, setDutouHistory] = useState({});
    
    // Ref to prevent AI arrangement from running multiple times
    const aiArrangementStarted = useRef(false);

    // 【已重构】只发牌，不理牌，确保瞬间进入
    const setupGame = useCallback((playerHand, ai1Hand, ai2Hand, ai3Hand, offlineMode = false) => {
        const initialPlayers = [
            { id: 'player', name: '你', hand: playerHand, rows: { front: [], middle: [], back: [] }, isReady: false },
            { id: 'ai1', name: '小明', hand: ai1Hand, rows: { front: [], middle: [], back: [] }, isReady: false },
            { id: 'ai2', name: '小红', hand: ai2Hand, rows: { front: [], middle: [], back: [] }, isReady: false },
            { id: 'ai3', name: '小刚', hand: ai3Hand, rows: { front: [], middle: [], back: [] }, isReady: false },
        ];
        setPlayers(initialPlayers);
        setIsGameActive(true);
        setComparisonResult(null);
        setDutouCurrent({});
        setDutouHistory({});
        setIsOfflineMode(offlineMode);
        aiArrangementStarted.current = false; // Reset the flag for a new game
    }, []);

    // 【新增】AI逐个、延时、异步理牌
    useEffect(() => {
        if (isGameActive && players.length > 0 && !aiArrangementStarted.current) {
            const aiPlayers = players.filter(p => p.id.startsWith('ai'));
            if (aiPlayers.length > 0) {
                aiArrangementStarted.current = true; // Mark that the process has started

                const arrangeNextAI = (index) => {
                    if (index >= aiPlayers.length) return; // All AIs are done

                    const aiPlayer = aiPlayers[index];

                    // Use a small timeout to move the heavy computation off the main thread
                    setTimeout(() => {
                        const bestRows = getAIThirteenBestArrangement(aiPlayer.hand);
                        setPlayers(prev => prev.map(p => 
                            p.id === aiPlayer.id ? { ...p, rows: bestRows, isReady: true } : p
                        ));
                        
                        // Wait 3 seconds before starting the next AI
                        setTimeout(() => {
                            arrangeNextAI(index + 1);
                        }, 3000);
                    }, 50);
                };

                arrangeNextAI(0); // Start with the first AI
            }
        }
    }, [isGameActive, players]);

    const startOfflineGame = useCallback(() => {
        const hands = dealAndShuffle();
        setupGame(hands.player, hands.ai1, hands.ai2, hands.ai3, true);
    }, [setupGame]);

    const startOnlineGame = useCallback((allCards) => {
        if (allCards?.length === 52) {
            const hands = { player: allCards.slice(0, 13), ai1: allCards.slice(13, 26), ai2: allCards.slice(26, 39), ai3: allCards.slice(39, 52) };
            setupGame(hands.player, hands.ai1, hands.ai2, hands.ai3, false);
        }
    }, [setupGame]);

    const resetGame = useCallback(() => {
        setPlayers([]);
        setIsGameActive(false);
    }, []);

    const updatePlayerRows = (newRows) => {
        setPlayers(prev => prev.map(p => p.id === 'player' ? { ...p, rows: newRows, isReady: false } : p));
    };

    // 【已重构】只为玩家理牌，并将其标记为“已准备好”
    const autoArrangePlayerHand = () => {
        setPlayers(prev => {
            const player = prev.find(p => p.id === 'player');
            if (player) {
                const bestRows = getAIThirteenBestArrangement(player.hand);
                // In offline mode, auto-arranging also means the player is ready
                return prev.map(p => p.id === 'player' ? { ...p, rows: bestRows, isReady: isOfflineMode } : p);
            }
            return prev;
        });
    };

    const startComparison = () => {
        // Before comparing, ensure the player is marked as ready
        let finalPlayers = players;
        const player = players.find(p => p.id === 'player');
        if (player && !player.isReady) {
            finalPlayers = players.map(p => p.id === 'player' ? { ...p, isReady: true } : p);
            setPlayers(finalPlayers);
        }

        if (finalPlayers.every(p => p.isReady)) {
            const results = calculateAllScores(finalPlayers);
            setComparisonResult(results);
            return { success: true, results };
        }
        return { success: false, message: "所有玩家尚未准备就绪。" };
    };
    
    const openDutouDialog = () => setDutouDialogOpen(true);
    const chooseDutouScore = (myId, score) => setDutouCurrent(prev => ({ ...prev, [myId]: { score } }));
    const challengeDutou = (dutouPlayerId, challengerId, challengerName) => {
        // Logic for "dutou" challenge
    };

    const value = {
        players, isGameActive, comparisonResult, startOnlineGame, startOfflineGame, resetGame, updatePlayerRows,
        autoArrangePlayerHand, startComparison, dutouCurrent, dutouHistory, chooseDutouScore, challengeDutou,
        openDutouDialog, isOfflineMode,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
            <DutouDialog open={isDutouDialogOpen} onClose={() => setDutouDialogOpen(false)} onSelectScore={(score) => chooseDutouScore('player', score)} />
        </GameContext.Provider>
    );
};
