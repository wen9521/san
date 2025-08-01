import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
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

// 发牌ID格式修正，和十三张/图片一致
const SUIT_NAMES = { S: 'spades', H: 'hearts', C: 'clubs', D: 'diamonds' };
const RANK_NAMES = {
    'A': 'ace', 'K': 'king', 'Q': 'queen', 'J': 'jack',
    'T': '10', '9': '9', '8': '8', '7': '7', '6': '6',
    '5': '5', '4': '4', '3': '3', '2': '2'
};

const dealCardsForEightGame = () => {
    const suits = ['S', 'H', 'C', 'D'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    let deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            const rankName = RANK_NAMES[rank];
            const suitName = SUIT_NAMES[suit];
            deck.push({ id: `${rankName}_of_${suitName}`, suit, rank });
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
    const [specialHand, setSpecialHand] = useState(null);

    // Ref to prevent AI arrangement from running multiple times
    const aiArrangementStarted = useRef(false);

    const startGame = useCallback(() => {
        const hands = dealCardsForEightGame();
        const playerNames = ['你', '小明', '小红', '小刚', '小强', '小黑'];
        const ids = ['player', 'ai1', 'ai2', 'ai3', 'ai4', 'ai5'];

        const playerList = ids.map((id, idx) => {
            const hand = sortEightGameCardsByRank(hands[idx]);
            const initialRows = (id === 'player') 
                ? { front: [], middle: hand, back: [] } 
                : { front: [], middle: [], back: [] };

            return { id, name: playerNames[idx], hand, rows: initialRows, isReady: false };
        });

        setPlayers(playerList);
        setCurrentPlayer(playerList[0]);
        setIsGameActive(true);
        setComparisonResult(null);
        setSpecialHand(null);
        aiArrangementStarted.current = false;
    }, []);

    useEffect(() => {
        if (isGameActive && players.length > 0 && !aiArrangementStarted.current) {
            const aiPlayers = players.filter(p => p.id.startsWith('ai'));
            if (aiPlayers.length > 0) {
                aiArrangementStarted.current = true;
                aiPlayers.forEach(aiPlayer => {
                    setTimeout(() => {
                        const bestRows = getAIEightGameBestArrangement(aiPlayer.hand);
                        setPlayers(prev => prev.map(p => 
                            p.id === aiPlayer.id ? { ...p, rows: bestRows, isReady: true } : p
                        ));
                    }, 50);
                });
            }
        }
    }, [isGameActive, players]);

    useEffect(() => {
        startGame();
    }, [startGame]);

    const setPlayerArrangement = (playerId, newRows) => {
        setPlayers(prevPlayers =>
            prevPlayers.map(p =>
                p.id === playerId ? { ...p, rows: newRows, isReady: false } : p
            )
        );
    };

    const autoArrangePlayerHand = () => {
        const player = players.find(p => p.id === 'player');
        if (!player) return;
        const best = getAIEightGameBestArrangement(player.hand);
        setPlayers(prev => prev.map(p => p.id === 'player' ? { ...p, rows: best, isReady: true } : p));
    };

    const startComparison = () => {
        let finalPlayers = players;
        const player = finalPlayers.find(p => p.id === 'player');
        if(player && !player.isReady) {
            finalPlayers = finalPlayers.map(p => p.id === 'player' ? { ...p, isReady: true } : p);
            setPlayers(finalPlayers);
        }
        
        if (!finalPlayers.every(p => p.isReady)) {
            return { success: false, message: "有玩家尚未准备好。" };
        }

        let scores = finalPlayers.map(p => ({ playerId: p.id, name: p.name, totalScore: 0 }));
        for (let i = 0; i < finalPlayers.length; i++) {
            for (let j = i + 1; j < finalPlayers.length; j++) {
                const result = calculateEightGameTotalScore(finalPlayers[i].rows, finalPlayers[j].rows);
                scores[i].totalScore += result.playerAScore;
                scores[j].totalScore += result.playerBScore;
            }
        }
        setComparisonResult({ scores, players: finalPlayers });
        return { success: true, results: { scores, players: finalPlayers } };
    };

    const value = {
        players, currentPlayer, isGameActive, startGame, setPlayerArrangement,
        autoArrangePlayerHand, startComparison, comparisonResult,
        specialHand, setSpecialHand
    };

    return <EightGameContext.Provider value={value}>{children}</EightGameContext.Provider>;
};
