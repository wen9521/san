import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';

// 模拟的玩家数据，用于展示
const generatePlayers = (count) => {
    const sampleNames = ['小龙', '小虎', '小豹', '小狼', '小鹰', '小狮'];
    const sampleAvatars = [
        '/avatars/avatar1.png',
        '/avatars/avatar2.png',
        '/avatars/avatar3.png',
        '/avatars/avatar4.png',
        '/avatars/avatar5.png',
        '/avatars/avatar6.png',
    ];
    
    let players = [];
    for (let i = 0; i < count; i++) {
        players.push({
            id: i + 1,
            name: sampleNames[i % sampleNames.length],
            avatar: sampleAvatars[i % sampleAvatars.length],
            isReady: Math.random() > 0.5,
            isHost: i === 0, // 假设第一个玩家是主机
        });
    }
    return players;
};


/**
 * 【核心改造】: 玩家状态组件现在可以适配不同数量的玩家
 * @param {object} props
 * @param {number} props.playerCount - 要显示的玩家数量 (例如 4 或 6)
 */
const PlayerStatus = ({ playerCount = 4 }) => {
    const players = generatePlayers(playerCount);

    // 将玩家分成两排
    const topRow = players.slice(0, Math.ceil(playerCount / 2));
    const bottomRow = players.slice(Math.ceil(playerCount / 2));

    const PlayerInfo = ({ player }) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Avatar src={player.avatar} sx={{ width: 60, height: 60, border: '2px solid #fff' }} />
            <Typography variant="subtitle2" sx={{ color: 'white' }}>{player.name}</Typography>
            <Chip 
                label={player.isReady ? '已准备' : '未准备'} 
                color={player.isReady ? 'success' : 'default'} 
                size="small" 
            />
        </Box>
    );

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
