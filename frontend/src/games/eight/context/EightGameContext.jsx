import React, { createContext, useState, useContext, useCallback, useEffect, useRef } from 'react';
import { 
    getAIEightGameBestArrangement, 
    validateEightGameArrangement, 
    sortEightGameCardsByRank, 
    evaluateEightGameHand,
    checkForEightGameSpecialHand,
    compareEightGameHands,
    EIGHT_GAME_HAND_TYPES
} from '../utils/eightLogic';
import { createDeck } from '../../../utils/deck.js'; // 【路径修正】

const EightGameContext = createContext();

export const useEightGame = () => {
    const context = useContext(EightGameContext);
    if (!context) throw new Error('useEightGame must be used within an EightGameProvider');
    return context;
};

// 使用新的deck工具来发牌
const dealCardsForEightGame = (numPlayers = 6) => {
    const deck = createDeck().sort(() => Math.random() - 0.5);
    const hands = [];
    for (let i = 0; i < numPlayers; i++) {
        hands.push(deck.slice(i * 8, (i + 1) * 8));
    }
    return hands;
};

const getHandScore = (winningHand, area) => {
    const type = winningHand.type;
    if (area === 'front') return (type === EIGHT_GAME_HAND_TYPES.PAIR) ? 2 : 1;
    if (area === 'middle') {
        if (type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH) return 10;
        if (type === EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND) return 6;
    }
    if (area === 'back') {
        if (type === EIGHT_GAME_HAND_TYPES.STRAIGHT_FLUSH) return 5;
        if (type === EIGHT_GAME_HAND_TYPES.THREE_OF_A_KIND) return 3;
    }
    return 1;
};

export const EightGameProvider = ({ children }) => {
    const [players, setPlayers] = useState([]);
    const [isGameActive, setIsGameActive] = useState(false);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [specialHand, setSpecialHand] = useState(null);
    
    const playersRef = useRef(players);
    playersRef.current = players;

    const startGame = useCallback((numPlayers = 6) => {
        setComparisonResult(null);
        setSpecialHand(null);

        const hands = dealCardsForEightGame(numPlayers);
        const playerNames = ['你', '小明', '小红', '小刚', '小强', '小黑'];
        const ids = ['player', 'ai1', 'ai2', 'ai3', 'ai4', 'ai5'];

        const playerList = ids.slice(0, numPlayers).map((id, idx) => {
            const hand = sortEightGameCardsByRank(hands[idx]);
            // 【重要修正】: 玩家的牌应该在手牌中，而不是直接在牌道里
            return { id, name: playerNames[idx], hand, rows: { front: [], middle: [], back: [] }, isReady: false };
        });

        setPlayers(playerList);
        setIsGameActive(true);
        
        const player = playerList.find(p => p.id === 'player');
        if (player) {
            const handIds = player.hand.map(c => c.id);
            const detectedSpecialHand = checkForEightGameSpecialHand(handIds);
            if (detectedSpecialHand) {
                setSpecialHand({ player, handInfo: detectedSpecialHand });
            }
        }

        // AI 自动理牌
        playerList.forEach(p => {
            if (p.id.startsWith('ai')) {
                const handIds = p.hand.map(c => c.id);
                const bestRowsIds = getAIEightGameBestArrangement(handIds);
                const bestRowsWithObjects = {
                    front: bestRowsIds.front.map(id => p.hand.find(card => card.id === id)),
                    middle: bestRowsIds.middle.map(id => p.hand.find(card => card.id === id)),
                    back: bestRowsIds.back.map(id => p.hand.find(card => card.id === id)),
                };
                setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, rows: bestRowsWithObjects, hand: [], isReady: true } : pl));
            }
        });
    }, []);

    useEffect(() => { startGame(); }, [startGame]);

    const setPlayerArrangement = (playerId, newRows) => {
        setPlayers(prevPlayers => prevPlayers.map(p => {
            if (p.id === playerId) {
                const allCardsInPlayerObject = [...p.hand, ...p.rows.front, ...p.rows.middle, ...p.rows.back];
                const cardsInNewRows = [...newRows.front, ...newRows.middle, ...newRows.back].map(c => c.id);
                const newHand = allCardsInPlayerObject.filter(c => !cardsInNewRows.includes(c.id));
                return { ...p, rows: newRows, hand: newHand, isReady: false };
            }
            return p;
        }));
    };
    
    const autoArrangePlayerHand = () => {
        const player = players.find(p => p.id === 'player');
        if (!player) return;
        const allCards = [...player.hand, ...player.rows.front, ...player.rows.middle, ...player.rows.back];
        const handIds = allCards.map(c => c.id);
        const best = getAIEightGameBestArrangement(handIds);
        const bestRowsWithObjects = {
            front: best.front.map(id => allCards.find(card => card.id === id)),
            middle: best.middle.map(id => allCards.find(card => card.id === id)),
            back: best.back.map(id => allCards.find(card => card.id === id)),
        };
        setPlayers(prev => prev.map(p => p.id === 'player' ? { ...p, rows: bestRowsWithObjects, hand: [], isReady: true } : p));
    };

    const confirmSpecialHand = () => {
        if (!specialHand) return;
        const { player, handInfo } = specialHand;
        const finalPlayers = playersRef.current.map(p => {
            if (p.id.startsWith('ai')) {
                const handIds = p.hand.map(c => c.id);
                const rows = getAIEightGameBestArrangement(handIds);
                const rowsWithObjects = {
                    front: rows.front.map(id => p.hand.find(card => card.id === id)),
                    middle: rows.middle.map(id => p.hand.find(card => card.id === id)),
                    back: rows.back.map(id => p.hand.find(card => card.id === id)),
                };
                return { ...p, rows: rowsWithObjects, hand:[], isReady: true };
            }
            return p;
        });

        setPlayers(finalPlayers);

        const matchupScores = {};
        finalPlayers.forEach(p => {
            if (p.id !== player.id) matchupScores[p.id] = -handInfo.score;
        });
        matchupScores[player.id] = handInfo.score * (finalPlayers.length - 1);
        
        setComparisonResult({ matchupScores, players: finalPlayers, specialWinner: player, details: null, handInfo });
        setSpecialHand(null);
    };

    const startComparison = () => {
        const currentPlayerState = playersRef.current;
        const player = currentPlayerState.find(p => p.id === 'player');
        
        if (player) {
            const playerRowsAsIds = {
                front: player.rows.front.map(c => c.id),
                middle: player.rows.middle.map(c => c.id),
                back: player.rows.back.map(c => c.id),
            };
            const { isValid, message } = validateEightGameArrangement(playerRowsAsIds);
            if (!isValid) {
                alert(`你的牌型不合法: ${message}`);
                return;
            }
        }
        
        const finalPlayers = currentPlayerState.map(p => ({ ...p, isReady: true }));
        setPlayers(finalPlayers);
        
        const evaluatedPlayers = finalPlayers.map(p => ({
            ...p,
            evaluatedRows: {
                front: evaluateEightGameHand(p.rows.front.map(c=>c.id)),
                middle: evaluateEightGameHand(p.rows.middle.map(c=>c.id)),
                back: evaluateEightGameHand(p.rows.back.map(c=>c.id))
            }
        }));

        let details = {};
        finalPlayers.forEach(p => { details[p.id] = { front: { points: 0 }, middle: { points: 0 }, back: { points: 0 }}; });

        for (let i = 0; i < evaluatedPlayers.length; i++) {
            for (let j = i + 1; j < evaluatedPlayers.length; j++) {
                const playerA = evaluatedPlayers[i];
                const playerB = evaluatedPlayers[j];
                ['front', 'middle', 'back'].forEach(area => {
                    const handA = playerA.evaluatedRows[area];
                    const handB = playerB.evaluatedRows[area];
                    if (!handA || !handB) return;
                    const comparison = compareEightGameHands(handA, handB);
                    if (comparison !== 0) {
                        const winnerHand = comparison > 0 ? handA : handB;
                        const areaScore = getHandScore(winnerHand, area);
                        details[playerA.id][area].points += (comparison > 0 ? areaScore : -areaScore);
                        details[playerB.id][area].points += (comparison < 0 ? areaScore : -areaScore);
                    }
                });
            }
        }
        const matchupScores = {};
        finalPlayers.forEach(p => {
            matchupScores[p.id] = details[p.id].front.points + details[p.id].middle.points + details[p.id].back.points
        });
        setComparisonResult({ matchupScores, players: finalPlayers, details });
    };

    const value = { players, startGame, setPlayerArrangement, autoArrangePlayerHand, startComparison, comparisonResult, specialHand, confirmSpecialHand };

    return <EightGameContext.Provider value={value}>{children}</EightGameContext.Provider>;
};
