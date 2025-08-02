import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { 
    findBestCombination, 
    validateArrangement,
    calcSSSAllScores
} from '../utils/thirteenLogic.js';
import { createDeck } from '../../../utils/deck.js'; // 【路径修正】

const GameContext = createContext();
export const useGame = () => useContext(GameContext);

// 使用新的deck工具来发牌
const dealCards = (numPlayers = 4) => {
    const deck = createDeck().sort(() => Math.random() - 0.5);
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
            const playerInfo = {
                id: index === 0 ? 'player' : `ai${index}`,
                name: index === 0 ? '你' : `电脑${index}`,
                hand: hand, // 【重要修正】: 存储完整的卡牌对象
                rows: { front: [], middle: [], back: [] },
                isReady: false
            };
            if (playerInfo.id === 'player') {
                // 初始化时，将牌直接放入三道中（作为对象）
                playerInfo.rows = {
                    front: hand.slice(0, 3),
                    middle: hand.slice(3, 8),
                    back: hand.slice(8, 13)
                };
                 // 玩家手牌应为空，因为所有牌都在牌道里
                playerInfo.hand = [];
            }
            return playerInfo;
        });
        
        setPlayers(initialPlayers);
        setIsGameActive(true);
    }, []);

    // AI 自动理牌逻辑
    useEffect(() => {
        if (isGameActive && players.length > 0) {
            const aiPlayersToUpdate = players.filter(p => p.id.startsWith('ai') && p.hand.length > 0);

            if (aiPlayersToUpdate.length > 0) {
                setTimeout(() => {
                    setPlayers(prevPlayers => {
                        const newPlayers = [...prevPlayers];
                        aiPlayersToUpdate.forEach(player => {
                            const handIds = player.hand.map(c => c.id);
                            const bestRowsIds = findBestCombination(handIds);
                            const bestRowsWithObjects = {
                                front: bestRowsIds.front.map(id => player.hand.find(card => card.id === id)),
                                middle: bestRowsIds.middle.map(id => player.hand.find(card => card.id === id)),
                                back: bestRowsIds.back.map(id => player.hand.find(card => card.id === id)),
                            };
                            
                            const playerIndex = newPlayers.findIndex(p => p.id === player.id);
                            if (playerIndex !== -1) {
                                newPlayers[playerIndex] = { ...newPlayers[playerIndex], rows: bestRowsWithObjects, hand: [], isReady: true };
                            }
                        });
                        return newPlayers;
                    });
                }, 500);
            }
        }
    }, [isGameActive, players]);
    
    useEffect(() => { startGame(); }, [startGame]);

    const setPlayerArrangement = (playerId, newRows) => {
        const cardIdsInRows = {
            front: newRows.front.map(c => c.id),
            middle: newRows.middle.map(c => c.id),
            back: newRows.back.map(c => c.id),
        };
        const { isValid } = validateArrangement(cardIdsInRows);
        setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, rows: newRows, isReady: isValid } : p));
    };

    const autoArrangePlayerHand = () => {
        setPlayers(prev => {
            const playerToUpdate = prev.find(p => p.id === 'player');
            if (playerToUpdate) {
                // AI理牌逻辑需要所有牌，所以合并各道牌
                const allCards = [...playerToUpdate.rows.front, ...playerToUpdate.rows.middle, ...playerToUpdate.rows.back];
                const allCardIds = allCards.map(c => c.id);

                const bestRowsIds = findBestCombination(allCardIds);

                const bestRowsWithObjects = {
                    front: bestRowsIds.front.map(id => allCards.find(card => card.id === id)),
                    middle: bestRowsIds.middle.map(id => allCards.find(card => card.id === id)),
                    back: bestRowsIds.back.map(id => allCards.find(card => card.id === id)),
                };
                return prev.map(p => p.id === 'player' ? { ...p, rows: bestRowsWithObjects, hand: [], isReady: true } : p);
            }
            return prev;
        });
    };

    const startComparison = () => {
        const player = players.find(p => p.id === 'player');
        if (!player) return;

        const playerRowsAsIds = {
            front: player.rows.front.map(c => c.id),
            middle: player.rows.middle.map(c => c.id),
            back: player.rows.back.map(c => c.id),
        };

        const { isValid, message } = validateArrangement(playerRowsAsIds);
        if (!isValid) {
            alert(`你的牌型不合法: ${message}`);
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
        
        // 【重要】将完整的玩家对象（包含卡牌对象）传递给比牌结果，以便于渲染
        results.players = players; 
        
        setComparisonResult(results);
    };

    const value = { players, isGameActive, startGame, setPlayerArrangement, autoArrangePlayerHand, comparisonResult, startComparison };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
