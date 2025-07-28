import React, { useState, useEffect } from 'react';
import { Button, Container, Typography, CircularProgress, Box, Stack, Chip, ButtonGroup } from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import ReplayIcon from '@mui/icons-material/Replay';
import SortByAlphaIcon from '@mui/icons-material/SortByAlpha';
import StyleIcon from '@mui/icons-material/Style';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import HandDisplay from '../components/HandDisplay';
import GameRows from '../components/GameRows';
import { sortCardsByRank, sortCardsBySuit, validateArrangement } from '../utils/thirteenLogic';
import '../styles/App.css';

const API_URL = 'https://9525.ip-ddns.com/api/deal.php';
const INITIAL_ROWS = { front: [], middle: [], back: [] };

function ThirteenGamePage() {
    const navigate = useNavigate();
    const { startGame, setPlayerReady, calculateResults } = useGame();
    
    const [initialHand, setInitialHand] = useState([]);
    const [unassignedHand, setUnassignedHand] = useState([]);
    const [rows, setRows] = useState(INITIAL_ROWS);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [validationResult, setValidationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (unassignedHand.length === 0 && initialHand.length > 0) {
            setValidationResult(validateArrangement(rows));
        } else {
            setValidationResult(null);
        }
    }, [rows, unassignedHand, initialHand]);

    const handleDealCards = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('API请求失败');
            const data = await response.json();
            if (data.success && data.hand.length === 52) {
                startGame(data.hand); // 使用Context启动游戏
                setInitialHand(sortCardsByRank(data.hand.slice(0, 13)));
                setUnassignedHand(sortCardsByRank(data.hand.slice(0, 13)));
                setRows(INITIAL_ROWS);
            } else {
                throw new Error('获取的牌数不足52张');
            }
        } catch (e) {
            setError(e.message || '发牌失败，请检查网络和后端');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirm = () => {
        if (validationResult?.isValid) {
            setPlayerReady(rows);
            // 等待state更新后再计算和导航
            setTimeout(() => {
                if (calculateResults()) {
                    navigate('/comparison');
                }
            }, 100);
        } else if (initialHand.length === 0) {
            // 如果还没有发牌就点击了确认按钮，可以给用户一个提示
            // 例如：setError("请先开始牌局发牌");
            console.log("请先开始牌局发牌");
        }
    };
    
    // ... 其他函数 (handleResetArrangement, handleSortHand, handleCardClick, handleRowClick, handleCardReturn) 与之前版本保持一致 ...
    const handleResetArrangement = () => { setUnassignedHand(initialHand); setRows(INITIAL_ROWS); setSelectedCardId(null); }; // 添加setSelectedCardId(null)
    const handleSortHand = (type) => setUnassignedHand(prev => (type === 'suit' ? sortCardsBySuit(prev) : sortCardsByRank(prev)));
    const handleCardClick = (id) => setSelectedCardId(p => (p === id ? null : id));
    const handleRowClick = (rowName) => {
        if (!selectedCardId) return;
        const limits = { front: 3, middle: 5, back: 5 };
        if (rows[rowName].length >= limits[rowName]) return;
        const card = unassignedHand.find(c => c.id === selectedCardId);
        if (card) {
            setUnassignedHand(p => p.filter(c => c.id !== selectedCardId));
            setRows(p => ({ ...p, [rowName]: sortCardsByRank([...p[rowName], card]) }));
            setSelectedCardId(null);
        }
    };
    const handleCardReturn = (card, fromRow) => {
        setRows(p => ({ ...p, [fromRow]: p[fromRow].filter(c => c.id !== card.id) }));
        setUnassignedHand(p => sortCardsByRank([...p, card]));
        setSelectedCardId(null); // 取回牌后取消选中
    };

    return (
        <Container className="page-container">
            <Box className="game-table glass-effect">
                <Typography variant="h4" sx={{ mb: 2 }}>你的牌局</Typography>
                {isLoading && <CircularProgress size={60} />}
                {error && <Typography color="error">{error}</Typography>}
                {!isLoading && !error && initialHand.length === 0 && ( // 只在未发牌时显示开始按钮
                    <Button variant="contained" size="large" onClick={handleDealCards} startIcon={<CasinoIcon />}>开始四人牌局</Button>
                )}
                {!isLoading && !error && initialHand.length > 0 && ( // 发牌后显示游戏界面
                    <>
                        <GameRows rows={rows} onRowClick={handleRowClick} validationResult={validationResult} onCardReturn={handleCardReturn} />
                        {validationResult && <Chip label={validationResult.message} color={validationResult.isValid ? "success" : "error"} sx={{ m: 2 }} />}
                        <Box sx={{ width: '100%', mt: 2, mb: 2 }}>
                           <Typography color="secondary" gutterBottom>手牌区 ({unassignedHand.length}张未分配)</Typography> {/* 显示未分配牌数 */}
                            <ButtonGroup variant="outlined" size="small" sx={{ mb: 1 }}><Button onClick={() => handleSortHand('rank')} startIcon={<SortByAlphaIcon/>}>按点数</Button><Button onClick={() => handleSortHand('suit')} startIcon={<StyleIcon/>}>按花色</Button></ButtonGroup>
                            <HandDisplay hand={unassignedHand} onCardClick={handleCardClick} selectedCardId={selectedCardId} />
                        </Box>
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <Button variant="outlined" color="secondary" onClick={handleResetArrangement} startIcon={<ReplayIcon />}>重置摆放</Button>
                            <Button variant="contained" color="success" onClick={handleConfirm} disabled={!validationResult?.isValid || unassignedHand.length > 0}>确认牌型 & 比牌</Button> {/* 牌未摆完禁用确认按钮 */}
                        </Stack>
                    </>
                )}
            </Box>
        </Container>
    );
}

export default ThirteenGamePage;