import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { 
    findBestCombination, 
    sortCards, 
    calculateTotalScore, 
    validateArrangement 
} from '../utils/thirteenLogic.js';

const SUIT_NAMES = { S: 'spades', H: 'hearts', C: 'clubs', D: 'diamonds' };
const RANK_NAMES = {
    'A': 'ace', 'K': 'king', 'Q': 'queen', 'J': 'jack',
    'T': '10', '9': '9', '8': '8', '7': '7', '6': '6',
    '5': '5', '4': '4', '3': '3', '2': '2'
};

const FULL_DECK = [];
for (const suit of ['S', 'H', 'C', 'D']) {
    for (const rank of ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']) {
        const rankName = RANK_NAMES[rank];
        const suitName = SUIT_NAMES[suit];
        FULL_DECK.push({ id: `${rankName}_of_${suitName}`, suit, rank });
    }
}

const GameContext = createContext();
export const useGame = () => useContext(GameContext);

const dealCards = () => {
    const deck = [...FULL_DECK].sort(() => Math.random() - 0.5);
    return [deck.slice(0, 13), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];
};

export const GameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null); // 新增状态

    const startGame = useCallback(() => {
        setComparisonResult(null); // 开始新游戏时清空结果
        const [playerHandRaw, aiHand1Raw, aiHand2Raw, aiHand3Raw] = dealCards();
        
        const initialPlayers = [
            { id: 'player', name: '你', hand: sortCards(playerHandRaw), rows: { front: [], middle: [], back: playerHandRaw }, isReady: false },
            { id: 'ai1', name: '电脑1', hand: sortCards(aiHand1Raw), rows: { front: [], middle: [], back: [] }, isReady: false },
            { id: 'ai2', name: '电脑2', hand: sortCards(aiHand2Raw), rows: { front: [], middle: [], back: [] }, isReady: false },
            { id: 'ai3', name: '电脑3', hand: sortCards(aiHand3Raw), rows: { front: [], middle: [], back: [] }, isReady: false }
        ];
        
        setPlayers(initialPlayers);
        setIsGameActive(true);
    }, []);

    useEffect(() => {
        if (isGameActive) {
            const aiPlayers = ['ai1', 'ai2', 'ai3'];
            aiPlayers.forEach((aiId, index) => {
                setTimeout(() => {
                    setPlayers(prev => {
                        const playerToUpdate = prev.find(p => p.id === aiId);
                        if (playerToUpdate) {
                            const bestRows = findBestCombination(playerToUpdate.hand);
                            return prev.map(p => p.id === aiId ? { ...p, rows: bestRows, isReady: true } : p);
                        }
                        return prev;
                    });
                }, (index + 1) * 1000); // AI理牌速度加快
            });
        }
    }, [isGameActive]);
    
    useEffect(() => { startGame(); }, [startGame]);

    const setPlayerArrangement = (playerId, newRows) => {
        const {isValid} = validateArrangement(newRows);
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, rows: newRows, isReady: isValid } : p));
    };

    const autoArrangePlayerHand = () => {
        setPlayers(prev => {
            const playerToUpdate = prev.find(p => p.id === 'player');
            if (playerToUpdate) {
                const bestRows = findBestCombination(playerToUpdate.hand);
                return prev.map(p => p.id === 'player' ? { ...p, rows: bestRows, isReady: true } : p);
            }
            return prev;
        });
    };

    // 新增比牌函数
    const startComparison = () => {
        const player = players.find(p => p.id === 'player');
        if (!player.isReady) {
            const { isValid, message } = validateArrangement(player.rows);
            if (!isValid) {
                alert(`你的牌型不合法: ${message}`);
                return;
            }
        }

        const finalPlayers = players.map(p => ({...p, isReady: true}));
        setPlayers(finalPlayers);

        const humanPlayer = finalPlayers.find(p => p.id === 'player');
        const aiPlayers = finalPlayers.filter(p => p.id !== 'player');
        
        const matchupScores = {};
        let humanPlayerTotalScore = 0;

        const details = {};
        finalPlayers.forEach(p => { details[p.id] = {}; });

        aiPlayers.forEach(opponent => {
            const result = calculateTotalScore(humanPlayer, opponent);
            matchupScores[opponent.id] = result.totalScoreB; // AI分数
            humanPlayerTotalScore += result.totalScoreA;
            details[humanPlayer.id][opponent.id] = result.details;
            details[opponent.id][humanPlayer.id] = result.details.map(d => ({...d, points: -d.points}));
        });
        matchupScores['player'] = humanPlayerTotalScore;

        setComparisonResult({ matchupScores, players: finalPlayers, details });
    };

    const value = { players, isGameActive, startGame, setPlayerArrangement, autoArrangePlayerHand, comparisonResult, startComparison };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};