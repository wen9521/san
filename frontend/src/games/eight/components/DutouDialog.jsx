import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    FormLabel
} from '@mui/material';

// 假设这是从 useEightGame context 传来的函数
const handleSelectDutou = (playerId, targetPlayerId, points) => {
    console.log(`${playerId} selected dutou on ${targetPlayerId} for ${points} points.`);
    // 在这里实现更新游戏状态的逻辑
};

function DutouDialog({ open, onClose }) {
    const [targetPlayer, setTargetPlayer] = useState('ai'); // 默认打电脑
    const [points, setPoints] = useState('1'); // 默认1分

    const handleConfirm = () => {
        // 'player' 是当前用户的ID，需要根据实际情况获取
        handleSelectDutou('player', targetPlayer, parseInt(points, 10));
        onClose(); // 关闭对话框
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>独头选择</DialogTitle>
            <DialogContent>
                <FormControl component="fieldset" margin="normal">
                    <FormLabel component="legend">选择要打的玩家</FormLabel>
                    <RadioGroup
                        row
                        name="targetPlayer"
                        value={targetPlayer}
                        onChange={(e) => setTargetPlayer(e.target.value)}
                    >
                        <FormControlLabel value="ai" control={<Radio />} label="电脑" />
                        {/* 如果有更多玩家，可以在这里添加 */}
                    </RadioGroup>
                </FormControl>
                <FormControl component="fieldset" margin="normal">
                    <FormLabel component="legend">选择分数</FormLabel>
                    <RadioGroup
                        row
                        name="points"
                        value={points}
                        onChange={(e) => setPoints(e.target.value)}
                    >
                        <FormControlLabel value="1" control={<Radio />} label="1分" />
                        <FormControlLabel value="2" control={<Radio />} label="2分" />
                        <FormControlLabel value="3" control={<Radio />} label="3分" />
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    取消
                </Button>
                <Button onClick={handleConfirm} color="primary" variant="contained">
                    确认
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DutouDialog;
