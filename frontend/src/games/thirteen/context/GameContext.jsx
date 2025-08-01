import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { findBestCombination, sortCards } from '../utils/thirteenLogic.js';

const SUIT_NAMES = { S: 'spades', H: 'hearts', C: 'clubs', D: 'diamonds' };
const RANK_NAMES = {
    'A': 'ace', 'K': 'king', 'Q': 'queen', 'J': 'jack',
    'T': '10', '9': '9', '8': '8', '7': '7', '6': '6',
    '5': '5', '4': '4', '3': '3', '2': '2'
};

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const dealCards = () => {
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
    return [deck.slice(0, 13), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];
};

export const GameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);

    const startGame = useCallback(() => {
        const [playerHandRaw, aiHand1, aiHand2, aiHand3] = dealCards();
        const playerHand = sortCards(playerHandRaw);
        
        setPlayers([
            { 
                id: 'player', 
                name: '你', 
                hand: playerHand, 
                rows: { 
                    front: playerHand.slice(0, 3), 
                    middle: playerHand.slice(3, 8), 
                    back: playerHand.slice(8, 13) 
                }, 
                isReady: false 
            },
            { 
                id: 'ai1', 
                name: '电脑1', 
                hand: sortCards(aiHand1), 
                rows: findBestCombination(aiHand1), 
                isReady: true 
            },
            { 
                id: 'ai2', 
                name: '电脑2', 
                hand: sortCards(aiHand2), 
                rows: findBestCombination(aiHand2), 
                isReady: true 
            },
            { 
                id: 'ai3', 
                name: '电脑3', 
                hand: sortCards(aiHand3), 
                rows: findBestCombination(aiHand3), 
                isReady: true 
            }
        ]);
        setIsGameActive(true);
        setComparisonResult(null);
    }, []);

    useEffect(() => {
        startGame();
    }, [startGame]);

    const setPlayerArrangement = (playerId, newRows) => {
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, rows: newRows } : p));
    };

    const autoArrangePlayerHand = () => {
        const player = players.find(p => p.id === 'player');
        if (!player || !player.hand) return;
        const bestRows = findBestCombination(player.hand);
        setPlayerArrangement('player', bestRows);
    };

    const value = { players, isGameActive, startGame, setPlayerArrangement, autoArrangePlayerHand, comparisonResult, setComparisonResult };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};