import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';

/**
 * 玩家信息单元
 * @param {object} props
 * @param {object} props.player - 包含玩家信息的对象 { id, name, avatar, isReady }
 */
const PlayerInfo = ({ player }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: '80px' }}>
        <Avatar src={player.avatar || `/avatars/avatar${(player.id % 6) + 1}.png`} sx={{ width: 60, height: 60, border: '2px solid #fff' }} />
        <Typography variant="subtitle2" sx={{ color: 'white', whiteSpace: 'nowrap' }}>{player.name}</Typography>
        <Chip 
            label={player.isReady ? '已准备' : '等待中'} 
            color={player.isReady ? 'success' : 'default'} 
            size="small" 
        />
    </Box>
);

/**
 * 【核心重构】: PlayerStatus 现在是一个纯粹的UI组件
 * 它接收一个完整的 players 数组并进行渲染，不再自己生成模拟数据。
 * @param {object} props
 * @param {Array<object>} props.players - 要显示的玩家对象数组
 */
const PlayerStatus = ({ players = [] }) => {
    if (!players || players.length === 0) {
        return null; // 如果没有玩家数据，不渲染任何东西
    }

    // 将玩家分成两排
    const topRow = players.slice(0, Math.ceil(players.length / 2));
    const bottomRow = players.slice(Math.ceil(players.length / 2));

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            {/* 顶部玩家 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 4 }}>
                {topRow.map(player => <PlayerInfo key={player.id} player={player} />)}
            </Box>
            {/* 底部玩家 */}
            {bottomRow.length > 0 && (
                 <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                    {bottomRow.map(player => <PlayerInfo key={player.id} player={player} />)}
                </Box>
            )}
        </Box>
    );
};

export default PlayerStatus;
