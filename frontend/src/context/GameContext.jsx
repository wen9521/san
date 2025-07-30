import React, { createContext, useState, useContext, useCallback } from 'react';
import { getAIBestArrangement, calculateAllScores, sortCardsByRank } from '../utils/thirteenLogic';
import { dealAndShuffle } from '../utils/deal';
import DutouDialog from '../components/DutouDialog';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [isDutouDialogOpen, setDutouDialogOpen] = useState(false);

    // 独头相关
    const [dutouCurrent, setDutouCurrent] = useState({}); // { [playerId]: { score } }
    const [dutouHistory, setDutouHistory] = useState({}); // { [playerId]: [{ challengerId, challengerName, score }] }

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
        setDutouCurrent({});
        setDutouHistory({});
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
        setDutouCurrent({});
        setDutouHistory({});
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

    const startComparison = () => {
        let updatedPlayers = [];
        setPlayers(prev => {
            updatedPlayers = prev.map(p =>
                p.id === 'player' ? { ...p, isReady: true } : p
            );
            return updatedPlayers;
        });
        const allPlayers = updatedPlayers.length > 0 ? updatedPlayers : players;
        if (allPlayers.every(p => p.isReady)) {
            const results = calculateAllScores(allPlayers);
            setComparisonResult(results);
            return { success: true };
        }
        return { success: false, message: "请等待所有玩家准备好" };
    };

    const openDutouDialog = () => setDutouDialogOpen(true);

    // 独头相关
    const chooseDutouScore = (myId, score) => {
        setDutouCurrent(prev => ({
            ...prev,
            [myId]: { score }
        }));
        setDutouDialogOpen(false);
    };

    const challengeDutou = (dutouPlayerId, challengerId, challengerName) => {
        setDutouCurrent(prev => {
            const score = prev[dutouPlayerId]?.score;
            if (!score) return prev;
            const newCurr = { ...prev };
            delete newCurr[dutouPlayerId];
            setDutouHistory(history => {
                const arr = history[dutouPlayerId] || [];
                const idx = arr.findIndex(x => x.challengerId === challengerId);
                if (idx >= 0) {
                    const updated = [...arr];
                    updated[idx] = {
                        ...updated[idx],
                        score: updated[idx].score + score
                    };
                    return {
                        ...history,
                        [dutouPlayerId]: updated
                    };
                } else {
                    return {
                        ...history,
                        [dutouPlayerId]: [...arr, { challengerId, challengerName, score }]
                    };
                }
            });
            return newCurr;
        });
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
        setPlayerReady,
        calculateResults,
        startComparison,
        dutouCurrent,
        dutouHistory,
        chooseDutouScore,
        challengeDutou,
        openDutouDialog,
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
