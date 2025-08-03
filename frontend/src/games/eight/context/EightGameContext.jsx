import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { 
    getAIEightGameBestArrangement, 
    validateEightGameArrangement, 
    sortEightGameCardsByRank, 
    evaluateEightGameHand,
    checkForEightGameSpecialHand,
    compareEightGameHands,
    EIGHT_GAME_HAND_TYPES
} from '../utils/eightLogic.js';
import { createDeck } from '../../../core/deck.js';

const EightGameContext = createContext();

export const useEightGame = () => {
    const context = useContext(EightGameContext);
    if (!context) throw new Error('useEightGame must be used within an EightGameProvider');
    return context;
};

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

const dealCardsForEightGame = (numPlayers = 6) => {
    const deck = createDeck().sort(() => Math.random() - 0.5);
    const hands = [];
    for (let i = 0; i < numPlayers; i++) {
        hands.push(deck.slice(i * 8, (i + 1) * 8));
    }
    return hands;
};

export const EightGameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [specialHand, setSpecialHand] = useState(null);

    const startGame = useCallback((numPlayers = 6) => {
        setComparisonResult(null);
        setSpecialHand(null);

        const hands = dealCardsForEightGame(numPlayers);
        const playerNames = ['你', '小明', '小红', '小刚', '小强', '小黑'];
        const ids = ['player', 'ai1', 'ai2', 'ai3', 'ai4', 'ai5'];

        const playerList = ids.slice(0, numPlayers).map((id, idx) => {
            const hand = sortEightGameCardsByRank(hands[idx]);
            const player = {
                id,
                name: playerNames[idx],
                hand,
                rows: { front: [], middle: [], back: [] },
                isReady: false
            };

            if (id.startsWith('ai')) { 
                const handIds = player.hand.map(c => c.id);
                const bestRowsIds = getAIEightGameBestArrangement(handIds);
                player.rows = {
                    front: bestRowsIds.front.map(cardId => player.hand.find(card => card.id === cardId)),
                    middle: bestRowsIds.middle.map(cardId => player.hand.find(card => card.id === cardId)),
                    back: bestRowsIds.back.map(cardId => player.hand.find(card => card.id === cardId)),
                };
                player.hand = [];
                player.isReady = true;
            } else { // Player
                player.rows.middle = hand;
                player.hand = [];
            }
            return player;
        });

        setPlayers(playerList);
        setIsGameActive(true);
        
        const player = playerList.find(p => p.id === 'player');
        if (player) {
            const playerAllCards = [...player.rows.front, ...player.rows.middle, ...player.rows.back];
            const handIds = playerAllCards.map(c => c.id);
            const detectedSpecialHand = checkForEightGameSpecialHand(handIds);
            if (detectedSpecialHand) {
                setSpecialHand({ player, handInfo: detectedSpecialHand });
            }
        }
    }, []);

    useEffect(() => { startGame(); }, [startGame]);

    const setPlayerArrangement = (playerId, newRows) => {
        setPlayers(prevPlayers => {
            const newPlayers = deepCopy(prevPlayers);
            const playerToUpdate = newPlayers.find(p => p.id === playerId);
            if (playerToUpdate) {
                playerToUpdate.rows = newRows;
                playerToUpdate.isReady = false; 
            }
            return newPlayers;
        });
    };
    
    const autoArrangePlayerHand = () => {
        setPlayers(prev => {
            const newPlayers = deepCopy(prev);
            const playerToUpdate = newPlayers.find(p => p.id === 'player');
            if (playerToUpdate) {
                const allCards = [...playerToUpdate.rows.front, ...playerToUpdate.rows.middle, ...playerToUpdate.rows.back];
                const handIds = allCards.map(c => c.id);
                const best = getAIEightGameBestArrangement(handIds);
                playerToUpdate.rows = {
                    front: best.front.map(id => allCards.find(card => card.id === id)),
                    middle: best.middle.map(id => allCards.find(card => card.id === id)),
                    back: best.back.map(id => allCards.find(card => card.id === id)),
                };
                playerToUpdate.isReady = true;
            }
            return newPlayers;
        });
    };
    
    const startComparison = () => {
        // Implementation for comparing hands should be here.
    };

    const value = { players, startGame, setPlayerArrangement, autoArrangePlayerHand, startComparison, comparisonResult, specialHand };

    return <EightGameContext.Provider value={value}>{children}</EightGameContext.Provider>;
};
