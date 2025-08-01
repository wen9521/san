import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { getAIThirteenGameBestArrangement, sortThirteenGameCardsByRank } from '../utils/thirteenLogic.js';

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
    return [deck.slice(0, 13), deck.slice(13, 26)];
};

export const GameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);

    const startGame = useCallback(() => {
        const [playerHandRaw, aiHand] = dealCards();
        const playerHand = sortThirteenGameCardsByRank(playerHandRaw);
        
        setPlayers([
            { 
                id: 'player', 
                name: '你', 
                hand: playerHand, 
                // 直接将牌按 3-5-5 分配到牌道
                rows: { 
                    front: playerHand.slice(0, 3), 
                    middle: playerHand.slice(3, 8), 
                    back: playerHand.slice(8, 13) 
                }, 
                isReady: false 
            },
            { 
                id: 'ai', 
                name: '电脑', 
                hand: sortThirteenGameCardsByRank(aiHand), 
                rows: getAIThirteenGameBestArrangement(aiHand), 
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
        if (!player) return;
        const bestRows = getAIThirteenGameBestArrangement(player.hand);
        setPlayerArrangement('player', bestRows);
    };

    const value = { players, isGameActive, startGame, setPlayerArrangement, autoArrangePlayerHand, comparisonResult, setComparisonResult };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};