import React from 'react';
import { Box } from '@mui/material';

// Mapping for card ranks and suits to match the SVG filenames
const rankMap = {
    'A': 'ace', 'K': 'king', 'Q': 'queen', 'J': 'jack', 'T': '10',
    '9': '9', '8': '8', '7': '7', '6': '6', '5': '5', '4': '4', '3': '3', '2': '2'
};
const suitMap = {
    'S': 'spades', 'H': 'hearts', 'C': 'clubs', 'D': 'diamonds'
};

/**
 * A reusable component to display a single poker card.
 * It dynamically constructs the path to the card's SVG image.
 * This is a shared component for all card games.
 */
const PokerCard = ({ card, width = 80, height = 112, isSelected = false, onClick }) => {
    // If no card data is provided, render a face-down card.
    if (!card || !card.rank || !card.suit) {
        return (
            <Box
                sx={{
                    width,
                    height,
                    backgroundImage: 'url(/assets/cards/card_back.svg)', // Generic card back
                    backgroundSize: 'cover',
                    borderRadius: 2,
                }}
            />
        );
    }

    const cardImageUrl = `/assets/cards/${rankMap[card.rank]}_of_${suitMap[card.suit]}.svg`;

    return (
        <Box
            onClick={onClick}
            sx={{
                width,
                height,
                cursor: onClick ? 'pointer' : 'default',
                transform: isSelected ? 'translateY(-20px) rotate(5deg)' : 'none',
                transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                    transform: onClick ? 'translateY(-10px)' : 'none'
                },
                img: {
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    filter: isSelected ? 'drop-shadow(0px 0px 10px #ffeb3b)' : 'none', // Add a glow when selected
                }
            }}
        >
            <img 
                src={cardImageUrl} 
                alt={`${card.rank} of ${suitMap[card.suit]}`}
            />
        </Box>
    );
};

export default PokerCard;
