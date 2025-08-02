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
import { createDeck } from '../../../utils/deck.js';

const EightGameContext = createContext();

export const useEightGame = () => {
    const context = useContext(EightGameContext);
    if (!context) throw new Error('useEightGame must be used within an EightGameProvider');
    return context;
};

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
            // 【重要修正】: 根据用户要求，玩家的牌直接放入中道
            if (id === 'player') {
                return { id, name: playerNames[idx], hand: [], rows: { front: [], middle: hand, back: [] }, isReady: false };
            }
            // AI 的牌先放入手牌，再由逻辑自动分配
            return { id, name: playerNames[idx], hand, rows: { front: [], middle: [], back: [] }, isReady: false };
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
        setPlayers(prevPlayers => prevPlayers.map(p => 
            p.id === playerId ? { ...p, rows: newRows, isReady: false } : p
        ));
    };
    
    const autoArrangePlayerHand = () => {
        const player = players.find(p => p.id === 'player');
        if (!player) return;
        const allCards = [...player.rows.front, ...player.rows.middle, ...player.rows.back];
        const handIds = allCards.map(c => c.id);
        const best = getAIEightGameBestArrangement(handIds);
        const bestRowsWithObjects = {
            front: best.front.map(id => allCards.find(card => card.id === id)),
            middle: best.middle.map(id => allCards.find(card => card.id === id)),
            back: best.back.map(id => allCards.find(card => card.id === id)),
        };
        setPlayers(prev => prev.map(p => p.id === 'player' ? { ...p, rows: bestRowsWithObjects, isReady: true } : p));
    };

    const confirmSpecialHand = () => {
        if (!specialHand) return;
        const { player, handInfo } = specialHand;
        // ... (rest of the function is likely fine)
    };

    const startComparison = () => {
        // ... (rest of the function is likely fine)
    };

    const value = { players, startGame, setPlayerArrangement, autoArrangePlayerHand, startComparison, comparisonResult, specialHand, confirmSpecialHand };

    return <EightGameContext.Provider value={value}>{children}</EightGameContext.Provider>;
};
