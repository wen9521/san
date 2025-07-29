import React, { useState, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Tabs, Tab, Box, Typography } from '@mui/material';
import { AuthContext } from '../context/AuthContext.jsx';

const phonePattern = /^1d{10}$/; // 仅允许中国大陆手机号

const AuthDialog = ({ open, onClose }) => {
  const { login, register } = useContext(AuthContext);
  const [tab, setTab] = useState(0);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [tip, setTip] = useState('');

  const handleAuth = async () => {
    setTip('');
    if (!phonePattern.test(phone)) {
      setTip('请输入正确的手机号');
      return;
    }
    if (password.length < 6) {
      setTip('密码至少6位');
      return;
    }
    if (tab === 0) {
      // 登录
      const res = await login(phone, password);
      if (res.success) onClose();
      else setTip(res.message);
    } else {
      // 注册
      const res = await register(phone, password);
      if (res.success) onClose();
      else setTip(res.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>账号{tab === 0 ? "登录" : "注册"}</DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="登录" />
          <Tab label="注册" />
        </Tabs>
        <TextField
          label="手机号"
          fullWidth
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/[^d]/g, ''))}
          margin="dense"
          inputProps={{ maxLength: 11 }}
        />
        <TextField
          label="密码"
          type="password"
          fullWidth
          value={password}
          onChange={e => setPassword(e.target.value)}
          margin="dense"
          inputProps={{ minLength: 6 }}
        />
        {tip && <Typography color="error" sx={{ mt: 1 }}>{tip}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button variant="contained" onClick={handleAuth}>{tab === 0 ? "登录" : "注册"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthDialog;
