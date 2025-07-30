import React, { createContext, useState, useEffect } from 'react';
import AuthDialog from '../components/AuthDialog';
import PointsDialog from '../components/PointsDialog';

export const AuthContext = createContext();

const API_BASE = "https://9525.ip-ddns.com/api"; // 改成你的 PHP API 路径

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthDialogOpen, setAuthDialogOpen] = useState(false);
  const [isPointsDialogOpen, setPointsDialogOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
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
      setAuthDialogOpen(false);
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
      setAuthDialogOpen(false);
    }
    return res || { success: false, message: '网络异常' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const openAuthDialog = () => setAuthDialogOpen(true);
  const openPointsDialog = () => setPointsDialogOpen(true);

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
    <AuthContext.Provider value={{ user, login, register, logout, openAuthDialog, openPointsDialog, searchUserByPhone, transferPoints }}>
      {children}
      <AuthDialog open={isAuthDialogOpen} onClose={() => setAuthDialogOpen(false)} />
      <PointsDialog open={isPointsDialogOpen} onClose={() => setPointsDialogOpen(false)} />
    </AuthContext.Provider>
  );
}
