import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { 
    findBestCombination, 
    validateArrangement,
    calcSSSAllScores
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

const dealCards = (numPlayers = 4) => {
    const deck = [...FULL_DECK].sort(() => Math.random() - 0.5);
    const hands = [];
    for(let i = 0; i < numPlayers; i++) {
        hands.push(deck.slice(i * 13, (i + 1) * 13));
    }
    return hands;
};

export const GameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);

    const startGame = useCallback((numPlayers = 4) => {
        setComparisonResult(null);
        const hands = dealCards(numPlayers);
        
        const initialPlayers = hands.map((hand, index) => {
            if (index === 0) {
                return { 
                    id: 'player', 
                    name: '你', 
                    hand: hand.map(c => c.id), // Store card IDs
                    rows: { 
                        front: hand.slice(0, 3).map(c=>c.id), 
                        middle: hand.slice(3, 8).map(c=>c.id), 
                        back: hand.slice(8, 13).map(c=>c.id)
                    }, 
                    isReady: false 
                };
            }
            return {
                id: `ai${index}`,
                name: `电脑${index}`,
                hand: hand.map(c => c.id),
                rows: { front: [], middle: [], back: [] },
                isReady: false
            };
        });
        
        setPlayers(initialPlayers);
        setIsGameActive(true);
    }, []);

    useEffect(() => {
        if (isGameActive && players.length > 0) {
            players.forEach(player => {
                if (player.id.startsWith('ai')) {
                    setTimeout(() => {
                        setPlayers(prev => {
                            const playerToUpdate = prev.find(p => p.id === player.id);
                            if (playerToUpdate) {
                                const bestRows = findBestCombination(playerToUpdate.hand);
                                return prev.map(p => p.id === player.id ? { ...p, rows: bestRows, isReady: true } : p);
                            }
                            return prev;
                        });
                    }, 500); // Stagger AI arrangement
                }
            });
        }
    }, [isGameActive, players.length]);
    
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
                setPlayerArrangement('player', bestRows);
            }
            return prev;
        });
    };

    const startComparison = () => {
        const player = players.find(p => p.id === 'player');
        if (!player) return;

        const { isValid, message } = validateArrangement(player.rows);
        if (!isValid) {
            alert(`你的牌型不合法: ${message}`);
            return;
        }

        const finalPlayers = players.map(p => ({ ...p, isReady: true }));
        setPlayers(finalPlayers);
        
        // Use the new simplified scoring function
        const results = calcSSSAllScores(finalPlayers);
        setComparisonResult(results);
    };

    const value = { players, isGameActive, startGame, setPlayerArrangement, autoArrangePlayerHand, comparisonResult, startComparison };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};