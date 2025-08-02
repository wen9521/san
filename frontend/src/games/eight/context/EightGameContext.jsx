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
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [specialHand, setSpecialHand] = useState(null); // { player, handInfo }

    const aiArrangementStarted = useRef(false);

    const startGame = useCallback(() => {
        aiArrangementStarted.current = false;
        setComparisonResult(null);
        setSpecialHand(null);

        const hands = dealCardsForEightGame();
        const playerNames = ['你', '小明', '小红', '小刚', '小强', '小黑'];
        const ids = ['player', 'ai1', 'ai2', 'ai3', 'ai4', 'ai5'];

        const playerList = ids.map((id, idx) => {
            const hand = sortEightGameCardsByRank(hands[idx]);
             const initialRows = (id === 'player') 
                ? { front: [], middle: [], back: hand } 
                : { front: [], middle: [], back: [] };
            return { id, name: playerNames[idx], hand, rows: initialRows, isReady: false };
        });

        setPlayers(playerList);
        setIsGameActive(true);

        // 检测玩家的特殊牌型
        const player = playerList.find(p => p.id === 'player');
        const detectedSpecialHand = checkForEightGameSpecialHand(player.hand);
        if (detectedSpecialHand) {
            setSpecialHand({ player, handInfo: detectedSpecialHand });
        }
    }, []);

    useEffect(() => {
        startGame();
    }, [startGame]);

    useEffect(() => {
        if (isGameActive && players.length > 0 && !aiArrangementStarted.current && !specialHand) {
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
    }, [isGameActive, players, specialHand]);

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

    const confirmSpecialHand = () => {
        if (!specialHand) return;
        
        const { player, handInfo } = specialHand;
        
        const scores = players.map(p => {
            let totalScore = 0;
            if (p.id === player.id) {
                totalScore = handInfo.score * (players.length -1);
            } else {
                totalScore = -handInfo.score;
            }
            return { playerId: p.id, name: p.name, totalScore };
        });

        setComparisonResult({ scores, players });
        setSpecialHand(null); // 清空特殊牌局，以防重复计算
    };

    const startComparison = () => {
        let finalPlayers = players.map(p => {
            if (p.id === 'player' && !p.isReady) {
                const { isValid, message } = validateEightGameArrangement(p.rows);
                if (!isValid) {
                    alert(`你的牌型不合法: ${message}`);
                    return null;
                }
                return { ...p, isReady: true };
            }
            return p;
        });

        if(finalPlayers.includes(null)) return { success: false, message: "牌型不合法" };

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
        players, isGameActive, startGame, setPlayerArrangement,
        autoArrangePlayerHand, startComparison, comparisonResult,
        specialHand, setSpecialHand, confirmSpecialHand
    };

    return <EightGameContext.Provider value={value}>{children}</EightGameContext.Provider>;
};