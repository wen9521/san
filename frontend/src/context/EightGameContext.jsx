import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
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
    const suits = ['S', 'H', 'C', 'D'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    let deck = [];
    for (const suit of suits) {
        for (const rank of ranks) {
            const cardId = `${rank.toLowerCase()}_of_${suit.toLowerCase()}`;
            deck.push({ id: cardId, suit, rank });
        }
    }
    deck = deck.sort(() => Math.random() - 0.5);
    const hands = [];
    // 只发两手牌：一个给玩家，一个给AI
    for (let i = 0; i < 2; i++) {
        hands.push(deck.slice(i * 8, (i + 1) * 8));
    }
    return hands;
};

export const EightGameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [isGameActive, setIsGameActive] = useState(false);
    
    const startGame = useCallback(() => {
        const hands = dealCardsForEightGame();
        
        const humanPlayer = {
            id: 'player',
            name: '你',
            hand: sortCardsByRank(hands[0]),
            rows: null, // 初始时没有牌型
            isReady: false,
        };

        const aiPlayer = {
            id: 'ai1',
            name: 'AI 对手',
            hand: sortCardsByRank(hands[1]),
            rows: null, // AI的牌型也先设为null
            isReady: false,
        };
        
        setPlayers([humanPlayer, aiPlayer]);
        setCurrentPlayer(humanPlayer);
        setIsGameActive(true);
    }, []);

    useEffect(() => {
        startGame();
    }, [startGame]);

    const setPlayerArrangement = (playerId, newRows) => {
        setPlayers(prevPlayers => {
            // 首先更新当前玩家的牌型和状态
            const updatedPlayers = prevPlayers.map(p =>
                p.id === playerId ? { ...p, rows: newRows, isReady: true } : p
            );

            // 找到AI玩家并为其设置最佳牌型
            return updatedPlayers.map(p => {
                if (p.id.startsWith('ai')) {
                    const aiBestArrangement = getAIEightBestArrangement(p.hand);
                    return { ...p, rows: aiBestArrangement, isReady: true };
                }
                return p;
            });
        });
    };

    const value = {
        players,
        currentPlayer,
        isGameActive,
        startGame,
        setPlayerArrangement,
    };

    return <EightGameContext.Provider value={value}>{children}</EightGameContext.Provider>;
};
