import React, { useState, useContext } from 'react';
import { Dialog, DialogTitle, DialogContent, Tabs, Tab, TextField, Button, Box, Typography } from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const AuthDialog = ({ open, onClose }) => {
    const { login, register } = useContext(AuthContext);
    const [tab, setTab] = useState(0); // 0 for login, 1 for register
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!/^1\d{10}$/.test(phone)) {
            setError('请输入有效的11位手机号');
            return;
        }
        if (password.length < 6) {
            setError('密码至少需要6位');
            return;
        }

        const action = tab === 0 ? login : register;
        const res = await action(phone, password);

        if (res && !res.success) {
            setError(res.message || '操作失败，请重试');
        } else {
            onClose(); // Success
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ textAlign: 'center' }}>
                <Tabs value={tab} onChange={handleTabChange} centered>
                    <Tab label="登录" />
                    <Tab label="注册" />
                </Tabs>
            </DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="phone"
                        label="手机号"
                        name="phone"
                        autoComplete="tel"
                        autoFocus
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="密码"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                            {error}
                        </Typography>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        {tab === 0 ? '登录' : '注册'}
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default AuthDialog;
