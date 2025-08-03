// frontend/src/games/eight/components/EightSpecialHandBanner.jsx
import React from 'react';
import { Paper, Typography, Button, Stack, Box } from '@mui/material';
import { keyframes } from '@mui/system';

const slideIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const EightSpecialHandBanner = ({ specialHand, onConfirm, onCancel }) => {
    if (!specialHand) return null;

    return (
        <Paper
            elevation={4}
            sx={{
                position: 'absolute',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                p: 1.5,
                backgroundColor: 'rgba(255, 235, 59, 0.95)', // A yellow-ish background
                color: 'black',
                zIndex: 1500, // High z-index to be on top
                animation: `${slideIn} 0.5s ease-out`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                minWidth: '300px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                <Box>
                    <Typography sx={{ fontWeight: 'bold' }}>特殊牌型: {specialHand.name}!</Typography>
                    <Typography variant="body2">可直接获胜并获得 {specialHand.score} 分。</Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                    <Button onClick={onConfirm} variant="contained" color="success" size="small">
                        免摆
                    </Button>
                    <Button onClick={onCancel} variant="outlined" color="error" size="small">
                        取消
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
};

export default EightSpecialHandBanner;
