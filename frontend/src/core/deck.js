// src/core/deck.js

const SUITS = ['S', 'H', 'C', 'D'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

/**
 * Creates a standard 52-card deck.
 * Each card is an object with a unique ID, rank, and suit.
 * This is shared logic for all card games.
 * @returns {Array<Object>} An array of card objects.
 */
export const createDeck = () => {
    let id = 1;
    const deck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ id: id++, rank, suit });
        }
    }
    return deck;
};

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {Array<any>} array The array to shuffle.
 * @returns {Array<any>} The shuffled array.
 */
export const shuffleDeck = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

/**
 * Returns the numerical value of a card rank.
 * @param {string} rank The rank of the card (e.g., 'A', 'K', '2').
 * @returns {number} The numerical value of the rank.
 */
export const getRankValue = (rank) => {
    const rankValues = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    return rankValues[rank] || 0;
};
