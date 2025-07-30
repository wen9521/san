import React, { useState, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Tabs, Tab, Box, Typography } from '@mui/material';
import { AuthContext } from '../context/AuthContext.jsx';

// 修正了正则表达式
const phonePattern = /^1\d{10}$/;

const AuthDialog = ({ open, onClose }) => {
  const { login, register } = useContext(AuthContext);
  const [tab, setTab] = useState(0);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [tip, setTip] = useState('');

  const handleAuth = async () => {
    setTip('');
    if (!phonePattern.test(phone)) {
      setTip('请输入11位中国大陆手机号');
      return;
    }
    if (password.length < 6) {
      setTip('密码至少需要6位');
      return;
    }
    
    let res;
    if (tab === 0) {
      res = await login(phone, password);
    } else {
      res = await register(phone, password);
    }

    if (res && res.success) {
      onClose();
    } else {
      setTip(res?.message || '操作失败，请稍后再试');
    }
  };

  // 清理状态
  const handleClose = () => {
    setPhone('');
    setPassword('');
    setTip('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle sx={{ textAlign: 'center' }}>
        {tab === 0 ? "欢迎回来" : "加入我们"}
      </DialogTitle>
      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered sx={{ mb: 2 }}>
          <Tab label="登录" />
          <Tab label="注册" />
        </Tabs>
        <TextField
          autoFocus
          label="手机号"
          fullWidth
          value={phone}
          // 修正了 onChange 事件处理器
          onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
          margin="dense"
          inputProps={{ maxLength: 11, type: 'tel' }}
          placeholder="请输入11位手机号"
        />
        <TextField
          label="密码"
          type="password"
          fullWidth
          value={password}
          onChange={e => setPassword(e.target.value)}
          margin="dense"
          inputProps={{ minLength: 6 }}
          placeholder="请输入至少6位密码"
        />
        {tip && <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>{tip}</Typography>}
      </DialogContent>
      <DialogActions sx={{ p: '8px 24px 16px' }}>
        <Button onClick={handleClose} sx={{ width: '50%' }}>取消</Button>
        <Button variant="contained" onClick={handleAuth} sx={{ width: '50%' }}>
          {tab === 0 ? "登录" : "注册"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthDialog;
