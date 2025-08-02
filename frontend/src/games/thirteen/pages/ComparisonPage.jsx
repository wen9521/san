import React from 'react';
import { Box, Typography, Button, Grid, Paper, Stack, Divider, CircularProgress } from '@mui/material';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';
import ThirteenCompactHandDisplay from '../components/ThirteenCompactHandDisplay';
import { getAreaType } from '../utils/thirteenLogic';

const PlayerComparisonCard = ({ player, totalScore, isFoul, specialType }) => {
    const getPointColor = (points) => {
        if (points > 0) return 'success.light';
        if (points < 0) return 'error.light';
        return 'text.secondary';
    };

    const HandRow = ({ hand, area }) => (
        <Box>
            <ThirteenCompactHandDisplay hand={hand} />
            <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'lightgray', textAlign: 'center', display: 'block' }}>
                {/* 【重要修正】: 确保传递给 getAreaType 的是 card ID 数组 */}
                {getAreaType(hand.map(c => c.id), area)}
            </Typography>
        </Box>
    );

    return (
        <Paper elevation={3} sx={{ p: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)', color: 'white', height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{player.name}</Typography>
                {totalScore !== undefined && (
                    <Typography variant="h6" sx={{ color: getPointColor(totalScore), fontWeight: 'bold' }}>
                        {totalScore > 0 ? `+${totalScore}` : totalScore}
                    </Typography>
                )}
            </Stack>
            <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.2)' }} />
            
            {isFoul ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%'}}>
                    <Typography color="error" variant="h5">倒水！</Typography>
                </Box>
            ) : specialType ? (
                 <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80%'}}>
                    <Typography color="secondary.light" variant="h5" sx={{fontWeight: 'bold'}}>{specialType}</Typography>
                </Box>
            ) : (
                <Stack spacing={1} sx={{height: '100%'}}>
                    {/* 确保 player.rows 存在 */}
                    {player.rows && (
                        <>
                            <HandRow hand={player.rows.back} area="tail" />
                            <HandRow hand={player.rows.middle} area="middle" />
                            <HandRow hand={player.rows.front} area="head" />
                        </>
                    )}
                </Stack>
            )}
        </Paper>
    );
};

function ComparisonPage() {
    // 【重要修正】: 直接从 context 获取 comparisonResult
    const { comparisonResult, startGame } = useGame();
    const navigate = useNavigate();

    // 如果没有结果，显示加载状态
    if (!comparisonResult) {
        return (
            <Box className="page-container-new-ui" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
                <Typography sx={{color: 'white', ml: 2}}>正在计算比牌结果...</Typography>
            </Box>
        );
    }
    
    // 从正确的结果中解构数据
    const { scores, details, players } = comparisonResult;

    const sortedPlayers = [...players].sort((a, b) => {
        if (a.id === 'player') return -1;
        if (b.id === 'player') return 1;
        return 0;
    });

    return (
        <Box className="page-container-new-ui" sx={{ p: { xs: 1, sm: 2 }, overflowY: 'auto' }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'white' }}>
                比牌结果
            </Typography>

            <Grid container spacing={{ xs: 1, sm: 2 }}>
                {sortedPlayers.map(player => {
                    const playerDetails = details.find(d => d.id === player.id);
                    return (
                        <Grid item xs={6} md={3} key={player.id}>
                            <PlayerComparisonCard 
                                player={player} 
                                totalScore={scores[player.id]}
                                isFoul={playerDetails?.isFoul}
                                specialType={playerDetails?.specialType}
                            />
                        </Grid>
                    )
                })}
            </Grid>
            
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: { xs: 2, sm: 3 } }}>
                <Button variant="contained" size="large" color="success" onClick={() => startGame(players.length)}>再来一局</Button>
                <Button variant="outlined" size="large" color="warning" onClick={() => navigate('/')}>退出游戏</Button>。
            </Stack>
        </Box>
    );
}

export default ComparisonPage;
