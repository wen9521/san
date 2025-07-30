import React, { createContext, useState, useContext, useCallback } from 'react';
import { getAIBestArrangement, calculateAllScores } from '../utils/thirteenLogic';
import { dealAndShuffle } from '../utils/deal';
import DutouDialog from '../components/DutouDialog';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [isDutouDialogOpen, setDutouDialogOpen] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    const [dutouCurrent, setDutouCurrent] = useState({});
    const [dutouHistory, setDutouHistory] = useState({});

    const setupGame = useCallback((playerHand, ai1Hand, ai2Hand, ai3Hand, offlineMode = false) => {
        const initialPlayers = [
            { id: 'player', name: '你', hand: playerHand, rows: getAIBestArrangement(playerHand), isReady: offlineMode },
            { id: 'ai1', name: '小明', hand: ai1Hand, rows: getAIBestArrangement(ai1Hand), isReady: true },
            { id: 'ai2', name: '小红', hand: ai2Hand, rows: getAIBestArrangement(ai2Hand), isReady: true },
            { id: 'ai3', name: '小刚', hand: ai3Hand, rows: getAIBestArrangement(ai3Hand), isReady: true },
        ];
        setPlayers(initialPlayers);
        setIsGameActive(true);
        setComparisonResult(null);
        setDutouCurrent({});
        setDutouHistory({});
        setIsOfflineMode(offlineMode);
    }, []);

    const startOfflineGame = useCallback(() => {
        const hands = dealAndShuffle();
        setupGame(hands.player, hands.ai1, hands.ai2, hands.ai3, true);
    }, [setupGame]);

    const startOnlineGame = useCallback((allCards) => {
        if (allCards && allCards.length === 52) {
            const hands = {
                player: allCards.slice(0, 13),
                ai1: allCards.slice(13, 26),
                ai2: allCards.slice(26, 39),
                ai3: allCards.slice(39, 52),
            };
            setupGame(hands.player, hands.ai1, hands.ai2, hands.ai3, false);
        }
    }, [setupGame]);

    const resetGame = useCallback(() => {
        setPlayers([]);
        setIsGameActive(false);
        setComparisonResult(null);
        setDutouCurrent({});
        setDutouHistory({});
        setIsOfflineMode(false);
    }, []);

    const updatePlayerRows = (newRows) => {
        setPlayers(prev => prev.map(p =>
            p.id === 'player' ? { ...p, rows: newRows, isReady: false } : p
        ));
    };

    const autoArrangePlayerHand = () => {
        setPlayers(prev => {
            const player = prev.find(p => p.id === 'player');
            if (player) {
                const bestRows = getAIBestArrangement(player.hand);
                const isPlayerReady = isOfflineMode; // 在试玩模式下，智能理牌后即准备好
                return prev.map(p => p.id === 'player' ? { ...p, rows: bestRows, isReady: isPlayerReady } : p);
            }
            return prev;
        });
    };

    const startComparison = () => {
        let finalPlayers = players;
        
        // 在试玩模式下，强制使用最佳牌型并设置为准备状态
        if (isOfflineMode) {
             const player = players.find(p => p.id === 'player');
             if (player && !player.isReady) {
                const bestRows = getAIBestArrangement(player.hand);
                finalPlayers = players.map(p => p.id === 'player' ? { ...p, rows: bestRows, isReady: true } : p);
                setPlayers(finalPlayers);
             }
        } else {
            // 在线模式，如果玩家未准备，则设置为准备状态
            const player = players.find(p => p.id === 'player');
            if(player && !player.isReady) {
                 finalPlayers = players.map(p => p.id === 'player' ? { ...p, isReady: true } : p);
                 setPlayers(finalPlayers);
            }
        }

        if (finalPlayers.every(p => p.isReady)) {
            const results = calculateAllScores(finalPlayers);
            setComparisonResult(results);
            return { success: true };
        }
        
        return { success: false, message: "所有玩家尚未准备就绪。" };
    };

    const openDutouDialog = () => setDutouDialogOpen(true);
    const chooseDutouScore = (myId, score) => {
        setDutouCurrent(prev => ({ ...prev, [myId]: { score } }));
        setDutouDialogOpen(false);
    };
    const challengeDutou = (dutouPlayerId, challengerId, challengerName) => {
        setDutouCurrent(prev => {
            const score = prev[dutouPlayerId]?.score;
            if (!score) return prev;
            const newCurr = { ...prev };
            delete newCurr[dutouPlayerId];
            setDutouHistory(h => ({ ...h, [dutouPlayerId]: [...(h[dutouPlayerId] || []), { challengerId, challengerName, score }] }));
            return newCurr;
        });
    };

    const value = {
        players, isGameActive, comparisonResult, startOnlineGame, startOfflineGame, resetGame, updatePlayerRows,
        autoArrangePlayerHand, startComparison, dutouCurrent, dutouHistory, chooseDutouScore, challengeDutou,
        openDutouDialog, isOfflineMode,
    };

    return (
        <GameContext.Provider value={value}>
            {children}
            <DutouDialog
                open={isDutouDialogOpen}
                onClose={() => setDutouDialogOpen(false)}
                onSelectScore={(score) => chooseDutouScore('player', score)}
            />
        </GameContext.Provider>
    );
};
