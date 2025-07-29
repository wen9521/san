import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';

/**
 * 通用玩家状态栏，适用于十三张/八张所有玩家数
 * 紧凑布局，横幅一整行，独头累计分数，按钮和横幅可联动
 */
const PlayerStatus = ({
    players = [],
    myId,
    dutouCurrent = {},
    dutouHistory = {},
    onDutouClick,
    onDutouScoreClick
}) => {
    if (!players || players.length === 0) return null;

    const getPlayerName = (id) => {
        const player = players.find(p => p.id === id);
        return player ? player.name : id;
    };

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
                justifyContent: 'flex-start'
            }}
        >
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.95rem', lineHeight: 1.1, wordBreak: 'break-all' }}>{player.name}</Typography>
            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>{isSelf ? '你' : '已理牌'}</Typography>
            {!isSelf && dutouCurrent[player.id]?.score && (
                <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    sx={{ mt: 0.5, fontSize: '0.85rem', minWidth: '48px', p: '2px 6px' }}
                    onClick={() => onDutouScoreClick && onDutouScoreClick(player.id, dutouCurrent[player.id].score)}
                >
                    独头{dutouCurrent[player.id].score}分
                </Button>
            )}
            {isSelf && (
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    sx={{ mt: 0.5, fontSize: '0.85rem', minWidth: '48px', p: '2px 6px' }}
                    onClick={onDutouClick}
                    disabled={!!dutouCurrent[player.id]?.score}
                >独头律师</Button>
            )}
            {isSelf && dutouCurrent[player.id]?.score && (
                <Chip
                    label={`已选${dutouCurrent[player.id].score}分`}
                    color="warning"
                    size="small"
                    sx={{ mt: 0.5, fontSize: '0.8rem' }}
                />
            )}
        </Box>
    );

    const renderBanner = (playerId) => {
        if (!dutouHistory[playerId] || dutouHistory[playerId].length === 0) return null;
        const summary = dutouHistory[playerId]
            .map(item => `${getPlayerName(item.challengerId)}${item.score}`)
            .join(' ');
        return (
            <Box
                key={'banner-' + playerId}
                sx={{
                    gridColumn: '1/-1',
                    width: '100%',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    mt: 0.5,
                    mb: 0.5,
                    textAlign: 'left'
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: '#fff',
                        fontWeight: 'bold',
                        background: 'rgba(0,0,0,0.35)',
                        borderRadius: '6px',
                        px: 1,
                        py: 0.5,
                        fontSize: '0.9rem',
                        letterSpacing: 1,
                        display: 'inline-block'
                    }}>
                    独头应战：{summary}
                </Typography>
            </Box>
        );
    };

    const cells = players.map(player =>
        renderPlayerCell(player, player.id === myId)
    );

    const banners = players
        .filter(p => dutouHistory[p.id] && dutouHistory[p.id].length > 0)
        .map(p => renderBanner(p.id));

    return (
        <Box
            sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                mb: 1
            }}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 0.5,
                width: '100%'
            }}>
                {cells}
            </Box>
            {banners}
        </Box>
    );
};

export default PlayerStatus;
