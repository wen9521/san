import React, { createContext, useState, useContext, useCallback, useEffect } from 'react'; // 【新增】引入 useEffect
import { getAIEightBestArrangement, validateEightArrangement, sortCardsByRank } from '../utils/eightLogic';

const EightGameContext = createContext();

export const useEightGame = () => {
    const context = useContext(EightGameContext);
    if (!context) {
        throw new Error('useEightGame must be used within an EightGameProvider');
    }
    return context;
};

const dealCardsForEightGame = () => {
    // This logic seems fine, using standard deck names for compatibility
    const suits = ['S', 'H', 'C', 'D']; 
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    let deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            // Ensure card ID format is consistent with what asset paths expect, e.g., "ace_of_spades.svg"
            const cardId = `${rank.toLowerCase()}_of_${suit.toLowerCase()}`; 
            deck.push({ id: cardId, suit, rank });
        }
    }
    
    // Shuffle and deal for up to 6 players (48 cards)
    deck = deck.sort(() => Math.random() - 0.5);
    const hands = [];
    for(let i=0; i<6; i++) {
        hands.push(deck.slice(i * 8, (i + 1) * 8));
    }
    return hands;
};

export const EightGameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null); // Keep track of the human player
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);

    const startGame = useCallback(() => {
        const hands = dealCardsForEightGame();

        const humanPlayer = { 
            id: 'player', 
            name: '你', 
            hand: sortCardsByRank(hands[0]), 
            rows: { front: [], middle: [], back: [] }, // Start with empty rows
            isReady: false 
        };

        const initialPlayers = [humanPlayer];
        for(let i=1; i<6; i++) {
            initialPlayers.push({
                id: `ai${i}`,
                name: `AI ${i}`,
                hand: hands[i],
                rows: getAIEightBestArrangement(hands[i]) || { front: [], middle: [], back: [] }, // Fallback for no valid arrangement
                isReady: true,
            });
        }

        setPlayers(initialPlayers);
        setCurrentPlayer(humanPlayer);
        setIsGameActive(true);
        setComparisonResult(null);
    }, []);

    // 【核心修复】: 在Provider加载时自动开始游戏
    useEffect(() => {
        startGame();
    }, [startGame]);


    const setPlayerArrangement = (playerId, newRows) => {
        setPlayers(prev => prev.map(p =>
            p.id === playerId ? { ...p, rows: newRows, isReady: true } : p
        ));
    };
    
    // Simplified logic, might need adjustment based on game flow
    const advanceToComparison = () => {
        // This function would calculate results, etc.
        console.log("Advancing to comparison stage...");
    };

    const value = {
        players,
        currentPlayer,
        isGameActive,
        comparisonResult,
        startGame,
        setPlayerArrangement,
        advanceToComparison,
    };

    return <EightGameContext.Provider value={value}>{children}</EightGameContext.Provider>;
};
