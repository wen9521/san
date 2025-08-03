import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { 
    findBestCombination, 
    validateArrangement,
    calcSSSAllScores
} from '../utils/thirteenLogic.js';
import { createDeck } from '../../../core/deck.js';

const ThirteenGameContext = createContext();
export const useThirteenGame = () => useContext(ThirteenGameContext);

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

const dealCards = (numPlayers = 4) => {
    const deck = createDeck().sort(() => Math.random() - 0.5);
    const hands = [];
    for(let i = 0; i < numPlayers; i++) {
        hands.push(deck.slice(i * 13, (i + 1) * 13));
    }
    return hands;
};

export const ThirteenGameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);

    const startGame = useCallback((numPlayers = 4) => {
        setComparisonResult(null);
        const hands = dealCards(numPlayers);
        
        const initialPlayers = hands.map((hand, index) => {
            const playerInfo = {
                id: index === 0 ? 'player' : `ai${index}`,
                name: index === 0 ? '你' : `电脑${index}`,
                hand: hand,
                rows: { front: [], middle: [], back: [] },
                isReady: false
            };

            if (playerInfo.id.startsWith('ai')) {
                const handIds = playerInfo.hand.map(c => c.id);
                const bestRowsIds = findBestCombination(handIds);
                playerInfo.rows = {
                    front: bestRowsIds.front.map(id => playerInfo.hand.find(card => card.id === id)),
                    middle: bestRowsIds.middle.map(id => playerInfo.hand.find(card => card.id === id)),
                    back: bestRowsIds.back.map(id => playerInfo.hand.find(card => card.id === id)),
                };
                playerInfo.hand = [];
                playerInfo.isReady = true;
            } else { // Player
                playerInfo.rows = {
                    front: hand.slice(0, 3),
                    middle: hand.slice(3, 8),
                    back: hand.slice(8, 13)
                };
                playerInfo.hand = [];
            }
            return playerInfo;
        });
        
        setPlayers(initialPlayers);
        setIsGameActive(true);
    }, []);

    useEffect(() => { startGame(); }, [startGame]);

    const setPlayerArrangement = (playerId, newRows) => {
        setPlayers(prev => {
            const newPlayers = deepCopy(prev);
            const playerToUpdate = newPlayers.find(p => p.id === playerId);
            if (playerToUpdate) {
                playerToUpdate.rows = newRows;
                const cardIdsInRows = {
                    front: newRows.front.map(c => c.id),
                    middle: newRows.middle.map(c => c.id),
                    back: newRows.back.map(c => c.id),
                };
                const { isValid } = validateArrangement(cardIdsInRows);
                playerToUpdate.isReady = isValid;
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
                const allCardIds = allCards.map(c => c.id);

                const bestRowsIds = findBestCombination(allCardIds);

                playerToUpdate.rows = {
                    front: bestRowsIds.front.map(id => allCards.find(card => card.id === id)),
                    middle: bestRowsIds.middle.map(id => allCards.find(card => card.id === id)),
                    back: bestRowsIds.back.map(id => allCards.find(card => card.id === id)),
                };
                playerToUpdate.hand = [];
                playerToUpdate.isReady = true;
            }
            return newPlayers;
        });
    };

    const startComparison = () => {
        const player = players.find(p => p.id === 'player');
        if (!player || !player.isReady) {
            alert('你的牌型不合法，请重新摆牌！');
            return;
        }

        const playersWithRowsAsIds = players.map(p => ({
            ...p,
            rows: {
                front: p.rows.front.map(c => c.id),
                middle: p.rows.middle.map(c => c.id),
                back: p.rows.back.map(c => c.id),
            }
        }));

        const results = calcSSSAllScores(playersWithRowsAsIds);
        results.players = deepCopy(players); 
        
        setComparisonResult(results);
    };

    const value = { players, isGameActive, startGame, setPlayerArrangement, autoArrangePlayerHand, comparisonResult, startComparison };

    return <ThirteenGameContext.Provider value={value}>{children}</ThirteenGameContext.Provider>;
};
