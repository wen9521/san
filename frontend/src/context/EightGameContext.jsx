import React, { createContext, useState, useContext, useCallback } from 'react';
import { getAIEightBestArrangement, validateEightArrangement, sortCardsByRank } from '../utils/eightLogic';

const EightGameContext = createContext();

export const useEightGame = () => useContext(EightGameContext);

const dealCardsForEightGame = () => {
    const suits = ['spades', 'hearts', 'clubs', 'diamonds'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'];
    let deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            const value = ranks.indexOf(rank) + 2;
            deck.push({ id: `${rank}_of_${suit}`, suit, rank, value });
        }
    }
    deck = deck.sort(() => Math.random() - 0.5).slice(0, 48);

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

    // 独头相关
    const [dutouCurrent, setDutouCurrent] = useState({});
    const [dutouHistory, setDutouHistory] = useState({});

    const startGame = useCallback(() => {
        const hands = dealCardsForEightGame();

        const playerInitialRows = {
            front: [],
            middle: sortCardsByRank(hands[0]), // 默认把八张牌都放在中道
            back: []
        };
        
        const initialPlayers = [
            { id: 'player', name: '你', hand: hands[0], rows: playerInitialRows, isReady: false },
        ];
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
        setDutouCurrent({});
        setDutouHistory({});
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
                return prev.map(p => p.id === 'player' ? { ...p, rows: getAIEightBestArrangement(player.hand), isReady: false } : p);
            }
            return prev;
        });
    };

    // 独头相关
    const chooseDutouScore = (myId, score) => {
        setDutouCurrent(prev => ({
            ...prev,
            [myId]: { score }
        }));
    };

    const challengeDutou = (dutouPlayerId, challengerId, challengerName) => {
        setDutouCurrent(prev => {
            const score = prev[dutouPlayerId]?.score;
            if (!score) return prev;
            // 清空当前独头分数
            const newCurr = { ...prev };
            delete newCurr[dutouPlayerId];
            // 累加历史
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
                }律师
            });
            return newCurr;
        });
    };

    const value = {
        players,
        isGameActive,
        comparisonResult,
        startGame,
        resetGame,
        updatePlayerRows,
        autoArrangePlayerHand,
        // 独头相关
        dutouCurrent,
        dutouHistory,
        chooseDutouScore,
        challengeDutou,
    };

    return <EightGameContext.Provider value={value}>{children}</EightGameContext.Provider>;
};
