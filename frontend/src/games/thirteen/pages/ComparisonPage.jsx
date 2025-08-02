import React from 'react';
import { Box, Typography, Button, Grid, Paper, Stack, CircularProgress } from '@mui/material';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import ThirteenCompactHandDisplay from '../components/ThirteenCompactHandDisplay';

// 新的玩家比牌卡片组件，以满足布局和对齐要求
const PlayerComparisonCard = ({ player, totalScore, isFoul, specialType }) => {
    const getPointColor = (points) => {
        if (points > 0) return 'success.light';
        if (points < 0) return 'error.light';
        return 'text.secondary';
    };

    // 用于显示单道牌的组件，增加了对齐选项
    const HandRow = ({ hand, align = 'center' }) => (
        <Box sx={{ display: 'flex', justifyContent: align, width: '100%' }}>
            <ThirteenCompactHandDisplay hand={hand} />
        </Box>
    );

    return (
        <Paper elevation={3} sx={{ p: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', color: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{player.name}</Typography>
                {totalScore !== undefined && (
                    <Typography variant="h6" sx={{ color: getPointColor(totalScore), fontWeight: 'bold' }}>
                        {totalScore > 0 ? `+${totalScore}` : totalScore}
                    </Typography>
                )}
            </Stack>
            
            <Stack spacing={1} sx={{ flexGrow: 1, justifyContent: 'space-around' }}>
                {isFoul ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                        <Typography color="error" variant="h5">倒水！</Typography>
                    </Box>
                ) : specialType ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                        <Typography color="secondary.light" variant="h5" sx={{fontWeight: 'bold'}}>{specialType}</Typography>
                    </Box>
                ) : (
                    player.rows && (
                        <>
                            {/* 尾道和中道居中对齐 */}
                            <HandRow hand={player.rows.back} align="center" />
                            <HandRow hand={player.rows.middle} align="center" />
                            {/* 【重要】头道左对齐 */}
                            <HandRow hand={player.rows.front} align="flex-start" />
                        </>
                    )
                )}
            </Stack>
        </Paper>
    );
};

// 重新设计的比牌页面
function ComparisonPage() {
    const { comparisonResult, startGame } = useGame();
    const navigate = useNavigate();

    if (!comparisonResult) {
        return (
            <Box className="page-container-new-ui" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress /><Typography sx={{color: 'white', ml: 2}}>正在计算比牌结果...</Typography>
            </Box>
        );
    }
    
    const { scores, details, players } = comparisonResult;

    const sortedPlayers = [...players].sort((a, b) => a.id === 'player' ? -1 : b.id === 'player' ? 1 : 0);

    return (
        <Box className="page-container-new-ui" sx={{ display: 'flex', flexDirection: 'column', p: { xs: 1, sm: 2 } }}>
            {/* 2x2 田字型布局 */}
            <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ flexGrow: 1 }}>
                {sortedPlayers.map(player => {
                    const playerDetails = details.find(d => d.id === player.id);
                    return (
                        <Grid item xs={6} md={6} key={player.id} sx={{ display: 'flex' }}>
                            <PlayerComparisonCard 
                                player={player} 
                                totalScore={scores[player.id]}
                                isFoul={playerDetails?.isFoul}
                                specialType={playerDetails?.specialType}
                            />
                        </Grid>
                    );
                })}
            </Grid>
            
            {/* 新的底部横幅 */}
            <Paper elevation={4} sx={{ 
                p: 1, 
                mt: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Button variant="contained" color="success" onClick={() => startGame(players.length)}>
                    继续游戏
                </Button>
                <Button variant="outlined" color="warning" onClick={() => navigate('/')}>
                    退出游戏
                </Button>
            </Paper>
        </Box>
    );
}

export default ComparisonPage;
