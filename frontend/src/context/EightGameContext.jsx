import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { 
    getAIEightGameBestArrangement, 
    validateEightGameArrangement, 
    sortEightGameCardsByRank, 
    evaluateEightGameHand,
    checkForEightGameSpecialHand,
    calculateEightGameTotalScore
} from '../utils/eightLogic';

const EightGameContext = createContext();

export const useEightGame = () => {
    const context = useContext(EightGameContext);
    if (!context) throw new Error('useEightGame must be used within an EightGameProvider');
    return context;
};

// 6人，每人8张
const dealCardsForEightGame = () => {
    const suits = ['S', 'H', 'C', 'D'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    let deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            const cardId = `${rank.toLowerCase()}_of_${suit.toLowerCase()}`;
            deck.push({ id: cardId, suit, rank });
        }
    }
    deck.sort(() => Math.random() - 0.5);
    const hands = [];
    for (let i = 0; i < 6; i++) {
        hands.push(deck.slice(i * 8, (i + 1) * 8));
    }
    return hands;
};

export const EightGameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [dutouCurrent, setDutouCurrent] = useState({});
    const [dutouHistory, setDutouHistory] = useState({});
    const [specialHand, setSpecialHand] = useState(null);

    const startGame = useCallback(() => {
        const hands = dealCardsForEightGame();
        const playerNames = ['你', '小明', '小红', '小刚', '小强', '小黑'];
        const ids = ['player', 'ai1', 'ai2', 'ai3', 'ai4', 'ai5'];
        const playerList = ids.map((id, idx) => ({
            id,
            name: playerNames[idx],
            hand: sortEightGameCardsByRank(hands[idx]),
            rows: null,
            isReady: false
        }));
        setPlayers(playerList);
        setCurrentPlayer(playerList[0]);
        setIsGameActive(true);
        setComparisonResult(null);
        setDutouCurrent({});
        setDutouHistory({});
        setSpecialHand(null);
    }, []);

    useEffect(() => {
        startGame();
    }, [startGame]);

    const setPlayerArrangement = (playerId, newRows) => {
        const validation = validateEightGameArrangement(newRows);
        if (!validation.isValid) {
            console.error("Attempted to set invalid arrangement:", validation.message);
            return;
        }
        const evaluatedRows = {
            ...newRows,
            frontType: evaluateEightGameHand(newRows.front).type,
            middleType: evaluateEightGameHand(newRows.middle).type,
            backType: evaluateEightGameHand(newRows.back).type,
        };
        setPlayers(prevPlayers => {
            // AI自动理牌
            return prevPlayers.map(p => {
                if (p.id === playerId) {
                    return { ...p, rows: evaluatedRows, isReady: true };
                }
                if (p.id.startsWith('ai') && (!p.rows || !p.isReady)) {
                    const aiBest = getAIEightGameBestArrangement(p.hand);
                    const aiEvaluated = {
                        ...aiBest,
                        frontType: evaluateEightGameHand(aiBest.front).type,
                        middleType: evaluateEightGameHand(aiBest.middle).type,
                        backType: evaluateEightGameHand(aiBest.back).type,
                    };
                    return { ...p, rows: aiEvaluated, isReady: true };
                }
                return p;
            });
        });
    };

    const autoArrangePlayerHand = () => {
        const player = players.find(p => p.id === 'player');
        if (!player) return;
        const best = getAIEightGameBestArrangement(player.hand);
        setPlayerArrangement('player', best);
    };

    // 6人两两比牌，每人得分累加
    const startComparison = () => {
        if (!players.every(p => p.rows && p.isReady)) return { success: false, message: "所有玩家尚未准备就绪。" };
        let scores = players.map(p => ({ playerId: p.id, name: p.name, totalScore: 0 }));
        for (let i = 0; i < players.length; i++) {
            for (let j = 0; j < players.length; j++) {
                if (i === j) continue;
                const score = calculateEightGameTotalScore(players[i].rows, players[j].rows).playerAScore;
                scores[i].totalScore += score;
            }
        }
        setComparisonResult({ scores, players: players.map(p => ({ ...p })) });
        return { success: true, results: { scores, players: players.map(p => ({ ...p })) } };
    };

    // 独头功能
    const openDutouDialog = () => {};
    const chooseDutouScore = (myId, score) => setDutouCurrent(prev => ({ ...prev, [myId]: { score } }));
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
        players,
        currentPlayer,
        isGameActive,
        startGame,
        setPlayerArrangement,
        autoArrangePlayerHand,
        startComparison,
        comparisonResult,
        dutouCurrent, dutouHistory,
        chooseDutouScore, challengeDutou, openDutouDialog,
        specialHand, setSpecialHand
    };

    return <EightGameContext.Provider value={value}>{children}</EightGameContext.Provider>;
};
