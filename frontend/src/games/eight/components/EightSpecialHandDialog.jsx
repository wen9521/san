// frontend/src/games/eight/components/EightSpecialHandDialog.jsx
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';

const EightSpecialHandDialog = ({ open, specialHand, onConfirm, onCancel }) => {
    if (!specialHand) return null;

    return (
        <Dialog open={open} onClose={onCancel} aria-labelledby="special-hand-dialog-title">
            <DialogTitle id="special-hand-dialog-title" sx={{ textAlign: 'center', backgroundColor: 'primary.main', color: 'white' }}>
                检测到特殊牌型！
            </DialogTitle>
            <DialogContent sx={{ textAlign: 'center', p: 3 }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'secondary.main', mb: 2 }}>
                    {specialHand.name}
                </Typography>
                <Typography variant="body1">
                    恭喜！您获得了特殊牌型 "{specialHand.name}"，可以直接获胜并获得 {specialHand.score} 分。
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                    您可以选择“免摆”来立即结算，或“取消免摆”继续手动摆牌。
                </Typography>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
                <Button onClick={onConfirm} variant="contained" color="success" size="large">
                    免摆 (赢 {specialHand.score} 分)
                </Button>
                <Button onClick={onCancel} variant="outlined" color="error" size="large">
                    取消免摆
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EightSpecialHandDialog;