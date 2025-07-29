import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * 【核心恢复】: 玩家状态现在是一个简单的绿色信息块
 */
const PlayerStatus = ({ players = [] }) => {
    if (!players || players.length === 0) {
        return null;
    }

    return (
        <Box 
            sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)', // 始终为4列
                gap: 1,
                width: '100%', 
                p: 1 
            }}
        >
            {players.map(player => (
                <Box 
                    key={player.id}
                    sx={{
                        background: 'rgba(0, 128, 0, 0.6)',
                        color: 'white',
                        borderRadius: '8px',
                        p: 1,
                        textAlign: 'center',
                        minHeight: '60px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="body1" sx={{fontWeight: 'bold'}}>{player.name}</Typography>
                    <Typography variant="caption">{player.id === 'player' ? '你' : '已理牌'}</Typography>
                </Box>
            ))}
        </Box>
    );
};

export default PlayerStatus;
