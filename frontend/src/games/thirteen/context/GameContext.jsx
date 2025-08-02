import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { findBestCombination, sortCards } from '../utils/thirteenLogic.js';

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

    const startGame = useCallback(() => {
        const [playerHandRaw, aiHand1Raw, aiHand2Raw, aiHand3Raw] = dealCards();
        
        const initialPlayers = [
            {
                id: 'player', name: '你', hand: sortCards(playerHandRaw),
                rows: { front: playerHandRaw.slice(0, 3), middle: playerHandRaw.slice(3, 8), back: playerHandRaw.slice(8, 13) },
                isReady: false
            },
            {
                id: 'ai1', name: '电脑1', hand: sortCards(aiHand1Raw),
                rows: { front: aiHand1Raw.slice(0, 3), middle: aiHand1Raw.slice(3, 8), back: aiHand1Raw.slice(8, 13) },
                isReady: false
            },
            {
                id: 'ai2', name: '电脑2', hand: sortCards(aiHand2Raw),
                rows: { front: aiHand2Raw.slice(0, 3), middle: aiHand2Raw.slice(3, 8), back: aiHand2Raw.slice(8, 13) },
                isReady: false
            },
            {
                id: 'ai3', name: '电脑3', hand: sortCards(aiHand3Raw),
                rows: { front: aiHand3Raw.slice(0, 3), middle: aiHand3Raw.slice(3, 8), back: aiHand3Raw.slice(8, 13) },
                isReady: false
            }
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
                }, (index + 1) * 2000);
            });
        }
    }, [isGameActive]);
    
    useEffect(() => {
        startGame();
    }, [startGame]);

    const setPlayerArrangement = (playerId, newRows) => {
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, rows: newRows } : p));
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

    const value = { players, isGameActive, startGame, setPlayerArrangement, autoArrangePlayerHand };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};