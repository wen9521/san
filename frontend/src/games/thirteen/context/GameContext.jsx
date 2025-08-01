import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { getAIThirteenGameBestArrangement, sortThirteenGameCardsByRank } from '../utils/thirteenLogic.js';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const dealCards = () => {
  const suits = ['S', 'H', 'C', 'D'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  let deck = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ id: `${rank}_of_${suit.toLowerCase()}`, suit, rank });
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
        const [playerHand, aiHand] = dealCards();
        setPlayers([
            { id: 'player', name: '你', hand: sortThirteenGameCardsByRank(playerHand), rows: { front: [], middle: [], back: [] }, isReady: false },
            { id: 'ai', name: '电脑', hand: sortThirteenGameCardsByRank(aiHand), rows: getAIThirteenGameBestArrangement(aiHand), isReady: true }
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

    const value = { players, isGameActive, startGame, setPlayerArrangement, comparisonResult, setComparisonResult };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
