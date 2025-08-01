import React, { useContext, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext.jsx';

const PointsDialog = ({ open, onClose }) => {
  const { user, searchUserByPhone, transferPoints } = useContext(AuthContext);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchTip, setSearchTip] = useState('');
  const [givePhone, setGivePhone] = useState('');
  const [giveAmount, setGiveAmount] = useState('');
  const [giveTip, setGiveTip] = useState('');

  const handleSearch = async () => {
    setSearchTip('');
    setSearchResult(null);
    if (!/^1d{10}$/.test(searchPhone)) {
      setSearchTip('手机号格式不正确');
      return;
    }
    const res = await searchUserByPhone(searchPhone);
    if (res.success) setSearchResult(res.data);
    else setSearchTip(res.message);
  };

  const handleGive = async () => {
    setGiveTip('');
    if (!/^1d{10}$/.test(givePhone)) {
      setGiveTip('手机号格式不正确');
      return;
    }
    if (!/^d+$/.test(giveAmount) || Number(giveAmount) <= 0) {
      setGiveTip('请输入要赠送的积分数量');
      return;
    }
    const res = await transferPoints(givePhone, Number(giveAmount));
    setGiveTip(res.message || (res.success ? '赠送成功' : '赠送失败'));
  };

  // 修复：onChange 事件应正确设置手机号（允许输入数字且首位为1，共11位）
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>积分管理</DialogTitle>
      <DialogContent>
        <Typography>我的手机号：{user?.phone || '--'}（ID: {user?.id || '--'}）</Typography>
        <Typography>我的积分：{user?.points ?? '--'}</Typography>
        <Box sx={{ my: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
          <Typography variant="subtitle2">通过手机号查询ID</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              label="手机号"
              value={searchPhone}
              onChange={e => {
                // 允许输入数字，首位必须是1，最多11位
                let val = e.target.value.replace(/D/g, '').slice(0, 11);
                if (val.length > 0 && val[0] !== '1') val = '1' + val.slice(1);
                setSearchPhone(val);
              }}
              inputProps={{ maxLength: 11, inputMode: 'numeric', pattern: '[0-9]*' }}
              size="small"
            />
            <Button variant="contained" onClick={handleSearch}>查询</Button>
          </Box>
          {searchTip && <Typography color="error">{searchTip}</Typography>}
          {searchResult &&
            <Typography sx={{ mt: 1 }}>
              ID: {searchResult.id}，手机号: {searchResult.phone}
            </Typography>
          }
        </Box>
        <Box sx={{ my: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
          <Typography variant="subtitle2">赠送积分</Typography>
          <TextField
            label="对方手机号"
            value={givePhone}
            onChange={e => {
              let val = e.target.value.replace(/D/g, '').slice(0, 11);
              if (val.length > 0 && val[0] !== '1') val = '1' + val.slice(1);
              setGivePhone(val);
            }}
            inputProps={{ maxLength: 11, inputMode: 'numeric', pattern: '[0-9]*' }}
            fullWidth
            margin="dense"
          />
          <TextField
            label="赠送积分"
            value={giveAmount}
            onChange={e => setGiveAmount(e.target.value.replace(/D/g, ''))}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            fullWidth
            margin="dense"
          />
          <Button variant="contained" fullWidth sx={{ mt: 1 }} onClick={handleGive}>确认赠送</Button>
          {giveTip && <Typography color={giveTip.includes('成功') ? "success.main" : "error"}>{giveTip}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>关闭</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PointsDialog;