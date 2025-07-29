import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const API_BASE = "https://serv00.com/api"; // 改成你的 PHP API 路径

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 尝试自动登录
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
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
    }
    return res || { success: false, message: '网络异常' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

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
      setUser({ ...user, points: user.points - amount });
      localStorage.setItem('user', JSON.stringify({ ...user, points: user.points - amount }));
    }
    return res || { success: false, message: '网络异常' };
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, searchUserByPhone, transferPoints }}>
      {children}
    </AuthContext.Provider>
  );
}
