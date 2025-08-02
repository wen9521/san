import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import { 
    getAIEightGameBestArrangement, 
    validateEightGameArrangement, 
    sortEightGameCardsByRank, 
    evaluateEightGameHand,
    checkForEightGameSpecialHand,
    calculateEightGameTotalScore,
    compareEightGameHands,
    EIGHT_GAME_HAND_TYPES
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

const getHandScore = (winningHand, area) => {
    const type = winningHand.type;
    if (area === 'front') return (type === EIGHT_GAME_HAND_TYPES.PAIR) ? winningHand.highCards[0] + 2 : 1;
    if (area === 'middle') {
        if (type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH) return 10;
        if (type === EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND) return 6;
        return 1;
    }
    if (area === 'back') {
        if (type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH) return 5;
        if (type === EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND) return 3;
        return 1;
    }
    return 1;
};

export const EightGameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [specialHand, setSpecialHand] = useState(null);

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
            // Correctly initialize rows: Player's cards go to middle, AI's are empty initially.
            const initialRows = (id === 'player') 
                ? { front: [], middle: hand, back: [] } 
                : { front: [], middle: [], back: [] };
            return { id, name: playerNames[idx], hand, rows: initialRows, isReady: false };
        });

        setPlayers(playerList);
        setIsGameActive(true);

        const player = playerList.find(p => p.id === 'player');
        const detectedSpecialHand = checkForEightGameSpecialHand(player.hand);
        if (detectedSpecialHand) {
            setSpecialHand({ player, handInfo: detectedSpecialHand });
        }
    }, []);

    useEffect(() => { startGame(); }, [startGame]);

    useEffect(() => {
        if (isGameActive && players.length > 0 && !aiArrangementStarted.current && !specialHand) {
            const aiPlayers = players.filter(p => p.id.startsWith('ai'));
            if (aiPlayers.length > 0) {
                aiArrangementStarted.current = true;
                aiPlayers.forEach(aiPlayer => {
                    setTimeout(() => {
                        const bestRows = getAIEightGameBestArrangement(aiPlayer.hand);
                        setPlayers(prev => prev.map(p => p.id === aiPlayer.id ? { ...p, rows: bestRows, isReady: true } : p));
                    }, 50);
                });
            }
        }
    }, [isGameActive, players, specialHand]);

    const setPlayerArrangement = (playerId, newRows) => {
        setPlayers(prevPlayers => prevPlayers.map(p => p.id === playerId ? { ...p, rows: newRows, isReady: false } : p));
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
        const matchupScores = {};
        players.forEach(p => {
            if (p.id !== player.id) {
                matchupScores[p.id] = -handInfo.score;
            }
        });
        matchupScores[player.id] = handInfo.score * (players.length - 1);

        setComparisonResult({ 
            matchupScores, 
            players, 
            specialWinner: player, 
            details: null,
            handInfo: handInfo
        });
        setSpecialHand(null);
    };

    const startComparison = () => {
        const player = players.find(p => p.id === 'player');
        if (player && !player.isReady) {
            const { isValid, message } = validateEightGameArrangement(player.rows);
            if (!isValid) {
                alert(`你的牌型不合法: ${message} (头道必须小于中道，中道必须小于尾道)`);
                return;
            }
        }
        
        const finalPlayers = players.map(p => ({ ...p, isReady: true }));
        setPlayers(finalPlayers);

        const evaluatedPlayers = finalPlayers.map(p => ({
            ...p,
            evaluatedRows: {
                front: evaluateEightGameHand(p.rows.front),
                middle: evaluateEightGameHand(p.rows.middle),
                back: evaluateEightGameHand(p.rows.back)
            }
        }));

        let details = {};
        finalPlayers.forEach(p => { details[p.id] = { front: { points: 0 }, middle: { points: 0 }, back: { points: 0 }}; });

        for (let i = 0; i < evaluatedPlayers.length; i++) {
            for (let j = i + 1; j < evaluatedPlayers.length; j++) {
                const playerA = evaluatedPlayers[i];
                const playerB = evaluatedPlayers[j];
                ['front', 'middle', 'back'].forEach(area => {
                    const handA = playerA.evaluatedRows[area];
                    const handB = playerB.evaluatedRows[area];
                    const comparison = compareEightGameHands(handA, handB);
                    if (comparison !== 0) {
                        const winnerHand = comparison > 0 ? handA : handB;
                        const areaScore = getHandScore(winnerHand, area);
                        details[playerA.id][area].points += (comparison > 0 ? areaScore : -areaScore);
                        details[playerB.id][area].points += (comparison < 0 ? areaScore : -areaScore);
                    }
                });
            }
        }

        const matchupScores = {};
        const humanPlayer = finalPlayers.find(p => p.id === 'player');
        let humanPlayerTotalScore = 0;
        
        finalPlayers.forEach(opponent => {
            if (opponent.id === 'player') return;
            const result = calculateEightGameTotalScore(humanPlayer.rows, opponent.rows);
            matchupScores[opponent.id] = result.playerBScore;
            humanPlayerTotalScore += result.playerAScore;
        });
        matchupScores['player'] = humanPlayerTotalScore;

        setComparisonResult({ matchupScores, players: finalPlayers, details });
    };

    const value = {
        players, isGameActive, startGame, setPlayerArrangement,
        autoArrangePlayerHand, startComparison, comparisonResult,
        specialHand, setSpecialHand, confirmSpecialHand
    };

    return <EightGameContext.Provider value={value}>{children}</EightGameContext.Provider>;
};