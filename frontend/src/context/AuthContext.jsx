import React, { createContext, useState, useEffect } from 'react';
import AuthDialog from '../components/AuthDialog';

export const AuthContext = createContext();

const API_BASE = "https://serv00.com/api"; // 改成你的 PHP API 路径

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthDialogOpen, setAuthDialogOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // 如果没有用户信息，可以决定是否自动弹出登录框
      // setAuthDialogOpen(true);
    }
  }, []);

  const login = async (phone, password) => {
    const res = await fetch(`${API_BASE}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    }).then(r => r.json()).catch(() => null);
    if (res && res.success) {
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setAuthDialogOpen(false); // 关闭对话框
    }
    return res || { success: false, message: '网络异常' };
  };

  const register = async (phone, password) => {
    const res = await fetch(`${API_BASE}/register.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    }).then(r => r.json()).catch(() => null);
    if (res && res.success) {
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setAuthDialogOpen(false); // 关闭对话框
    }
    return res || { success: false, message: '网络异常' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // 退出后可以视情况决定是否弹出登录框
    // setAuthDialogOpen(true);
  };

  const openAuthDialog = () => setAuthDialogOpen(true);

  const searchUserByPhone = async (phone) => {
    const res = await fetch(`${API_BASE}/points.php?action=search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    }).then(r => r.json()).catch(() => null);
    return res || { success: false, message: '网络异常' };
  };

  const transferPoints = async (toPhone, amount) => {
    if (!user) return { success: false, message: '请先登录' };
    const res = await fetch(`${API_BASE}/points.php?action=transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: user.phone, to: toPhone, amount })
    }).then(r => r.json()).catch(() => null);
    if (res && res.success) {
      const updatedUser = { ...user, points: user.points - amount };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return res || { success: false, message: '网络异常' };
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, openAuthDialog, searchUserByPhone, transferPoints }}>
      {children}
      <AuthDialog open={isAuthDialogOpen} onClose={() => setAuthDialogOpen(false)} />
    </AuthContext.Provider>
  );
}
