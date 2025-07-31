import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { 
    getAIEightGameBestArrangement, 
    validateEightGameArrangement, 
    sortEightGameCardsByRank, 
    evaluateEightGameHand,
    checkForEightGameSpecialHand 
} from '../utils/eightLogic';

const EightGameContext = createContext();

export const useEightGame = () => {
    const context = useContext(EightGameContext);
    if (!context) throw new Error('useEightGame must be used within an EightGameProvider');
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
    deck.sort(() => Math.random() - 0.5);
    const hands = [];
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
        const humanPlayer = { id: 'player', name: '你', hand: sortEightGameCardsByRank(hands[0]), rows: null, isReady: false };
        const aiPlayer = { id: 'ai1', name: 'AI 对手', hand: sortEightGameCardsByRank(hands[1]), rows: null, isReady: false };
        setPlayers([humanPlayer, aiPlayer]);
        setCurrentPlayer(humanPlayer);
        setIsGameActive(true);
    }, []);

    useEffect(() => {
        startGame();
    }, [startGame]);

    const setPlayerArrangement = (playerId, newRows) => {
        const validation = validateEightGameArrangement(newRows);
        if (!validation.isValid) {
            console.error("Attempted to set invalid arrangement:", validation.message);
            return;
        }

        const evaluatedRows = {
            ...newRows,
            frontType: evaluateEightGameHand(newRows.front).type,
            middleType: evaluateEightGameHand(newRows.middle).type,
            backType: evaluateEightGameHand(newRows.back).type,
        };

        setPlayers(prevPlayers => {
            const updatedPlayers = prevPlayers.map(p =>
                p.id === playerId ? { ...p, rows: evaluatedRows, isReady: true } : p
            );

            return updatedPlayers.map(p => {
                if (p.id.startsWith('ai')) {
                    const aiBestArrangement = getAIEightGameBestArrangement(p.hand);
                    if (aiBestArrangement) {
                        const aiEvaluatedRows = {
                           ...aiBestArrangement,
                            frontType: evaluateEightGameHand(aiBestArrangement.front).type,
                            middleType: evaluateEightGameHand(aiBestArrangement.middle).type,
                            backType: evaluateEightGameHand(aiBestArrangement.back).type,
                        };
                        return { ...p, rows: aiEvaluatedRows, isReady: true };
                    }
                    // 【已修复】如果AI没有找到牌型，依然返回一个准备好的玩家对象，而不是undefined
                    return { ...p, isReady: true, rows: { front: [], middle: [], back: [] } }; // 提供一个空的rows结构
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
