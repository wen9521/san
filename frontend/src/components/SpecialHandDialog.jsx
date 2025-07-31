import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

/**
 * A dialog to ask the player if they want to use a special hand type.
 */
const SpecialHandDialog = ({ open, specialHandName, onClose, onConfirm }) => {
  if (!open) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="special-hand-dialog-title"
      aria-describedby="special-hand-dialog-description"
    >
      <DialogTitle id="special-hand-dialog-title">
        检测到特殊牌型！
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="special-hand-dialog-description">
          您拿到了特殊牌型：<strong>{specialHandName}</strong>。
          <br />
          您想立即以此牌型获胜吗？如果选择否则将继续正常比牌。
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          否，继续比牌
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          是，使用特殊牌型
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SpecialHandDialog;
