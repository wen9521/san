import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import HandDisplay from '../components/HandDisplay';
import { GameRow } from '../components/GameRow'; // Corrected import
import { useGame } from '../context/GameContext';
import { validateEightArrangement, checkForSpecialHand } from '../utils/eightLogic';
import SpecialHandDialog from '../components/SpecialHandDialog';

const cardHeight = 112; // Standard card height in pixels

/**
 * A specialized component to display a player's arranged hand with a compact, overlapping layout.
 */
const PlayerDisplay = ({ player }) => {
  if (!player || !player.rows) {
    return <Paper sx={{ height: '100%', background: 'rgba(0,0,0,0.2)' }} />;
  }
  
  const { front, middle, back } = player.rows;

  const OverlappedHand = ({ cards, top, zIndex }) => (
    <Box sx={{ position: 'absolute', top: `${top}px`, left: 0, right: 0, zIndex }}>
      <HandDisplay cards={cards} source="rows" />
    </Box>
  );

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        overflow: 'hidden', // Ensures no internal scrolling
      }}
    >
      <Typography variant="h6" sx={{ p: 1, textAlign: 'center', background: 'rgba(0,0,0,0.2)', fontSize: '0.9rem' }}>
        {player.name}
      </Typography>
      <Box sx={{ flexGrow: 1, position: 'relative' }}>
        {/* This container clips the bottom half of the last row */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
          <OverlappedHand cards={front} top={0} zIndex={1} />
          <OverlappedHand cards={middle} top={cardHeight / 2 - 20} zIndex={2} />
          <OverlappedHand cards={back} top={cardHeight - 40} zIndex={3} />
        </Box>
      </Box>
    </Paper>
  );
};


const EightGamePage = () => {
  const { players, player, setPlayerRows, goToNextStage } = useGame();
  const [rows, setRows] = useState({ front: [], middle: [], back: [] });
  const [isValid, setIsValid] = useState(false);
  const [specialHand, setSpecialHand] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const detectedSpecialHand = checkForSpecialHand(player.hand);
    if (detectedSpecialHand) {
      setSpecialHand(detectedSpecialHand);
      setDialogOpen(true);
    }
  }, [player.hand]);

  const handleDrop = (card, targetRow) => {
    const newRows = { front: [...rows.front], middle: [...rows.middle], back: [...rows.back] };
    
    Object.keys(newRows).forEach(rowName => {
      newRows[rowName] = newRows[rowName].filter(c => c.id !== card.id);
    });

    newRows[targetRow] = [...newRows[targetRow], card];

    setRows(newRows);
    const validation = validateEightArrangement(newRows);
    setIsValid(validation.isValid);
  };
  
  const handleConfirm = () => {
    const validation = validateEightArrangement(rows);
    if (validation.isValid) {
      setPlayerRows(player.id, rows);
      goToNextStage();
    } else {
      alert(validation.message);
    }
  };

  const handleSpecialHandDecision = (useSpecial) => {
    setDialogOpen(false);
    if (useSpecial) {
      console.log(`${player.name} uses special hand: ${specialHand.name}`);
    }
  };

  if (players.every(p => p.rows && p.rows.front && p.rows.front.length > 0)) {
    return (
      <Box sx={{ width: '100vw', height: '100vh', p: 1, background: 'radial-gradient(circle, #2c4a3b 0%, #1a2a28 100%)', boxSizing: 'border-box' }}>
        <Grid container spacing={1} sx={{ height: '100%' }}>
          {players.slice(0, 6).map(p => (
            <Grid item xs={6} key={p.id} sx={{ height: '33.33%' }}>
              <PlayerDisplay player={p} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Arrangement UI
  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ p: 2, background: '#222', minHeight: '100vh', color: 'white' }}>
        <Typography variant="h4">{player.name}'s Turn</Typography>
        <HandDisplay cards={player.hand} source="hand" />
        
        <Box sx={{ my: 3 }}>
          <GameRow name="后道 (3)" cards={rows.back} onDrop={(card) => handleDrop(card, 'back')} />
          <GameRow name="中道 (3)" cards={rows.middle} onDrop={(card) => handleDrop(card, 'middle')} />
          <GameRow name="头道 (2)" cards={rows.front} onDrop={(card) => handleDrop(card, 'front')} />
        </Box>
        
        <Button variant="contained" color="primary" onClick={handleConfirm} disabled={!isValid}>
          确认牌型
        </Button>
        <SpecialHandDialog 
          open={dialogOpen}
          specialHandName={specialHand?.name}
          onClose={() => handleSpecialHandDecision(false)}
          onConfirm={() => handleSpecialHandDecision(true)}
        />
      </Box>
    </DndProvider>
  );
};

export default EightGamePage;
