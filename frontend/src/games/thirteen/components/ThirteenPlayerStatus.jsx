import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * 通用玩家状态栏，适用于十三张/八张所有玩家数
 * 已移除独头功能与文字
 */
const ThirteenPlayerStatus = ({ players = [], myId }) => {
    if (!players || players.length === 0) return null;

    const renderPlayerCell = (player, isSelf = false) => (
        <Box
            key={player.id}
            sx={{
                background: isSelf ? 'rgba(255, 193, 7, 0.7)' : 'rgba(0, 128, 0, 0.6)',
                color: 'white',
                borderRadius: '6px',
                px: 0.5,
                py: 0.5,
                textAlign: 'center',
                minHeight: '32px',
                minWidth: '0',
                flex: '1 1 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.95rem', lineHeight: 1.1, wordBreak: 'break-all' }}>{player.name}</Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{isSelf ? '你' : '已理牌'}</Typography>
        </Box>
    );

    const cells = players.map(player =>
        renderPlayerCell(player, player.id === myId)
    );

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                gap: 0.5,
                mb: 1
            }}
        >
            {cells}
        </Box>
    );
};

export default ThirteenPlayerStatus;
