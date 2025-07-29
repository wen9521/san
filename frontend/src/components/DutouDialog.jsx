import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack } from '@mui/material';

const SCORES = [10, 20, 50, 100];

const DutouDialog = ({ open, onClose, onSelectScore }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>请选择独头分数</DialogTitle>
        <DialogContent>
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {SCORES.map(score => (
                    <Button
                        key={score}
                        variant="contained"
                        color="warning"
                        onClick={() => onSelectScore(score)}
                    >
                        {score}分
                    </Button>
                ))}
            </Stack>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}>取消</Button>
        </DialogActions>
    </Dialog>
);

export default DutouDialog;
