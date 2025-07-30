import React, { createContext, useState, useEffect } from 'react';
import AuthDialog from '../components/AuthDialog';
import PointsDialog from '../components/PointsDialog';

export const AuthContext = createContext();

const API_BASE = "https://9525.ip-ddns.com/api";
// 已更新为更复杂的密钥
const APP_SECRET = 'Xla2M666amiV9QehKwOTDJb8uvkozemr'; 

// 封装 fetch 请求，自动添加密钥
const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'X-App-Secret': APP_SECRET,
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
        // 尝试解析错误响应体
        const errorBody = await response.json().catch(() => ({ message: '无法解析响应' }));
        return { success: false, message: errorBody.message || `网络错误: ${response.status}` };
    }
    return response.json();
  } catch (error) {
    return { success: false, message: '网络请求失败' };
  }
};


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
    const res = await fetchWithAuth(`${API_BASE}/login.php`, {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });
    if (res && res.success) {
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setAuthDialogOpen(false);
    }
    return res;
  };

  const register = async (phone, password) => {
    const res = await fetchWithAuth(`${API_BASE}/register.php`, {
      method: 'POST',
      body: JSON.stringify({ phone, password })
    });
    if (res && res.success) {
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setAuthDialogOpen(false);
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const openAuthDialog = () => setAuthDialogOpen(true);
  const openPointsDialog = () => setPointsDialogOpen(true);

  const searchUserByPhone = async (phone) => {
    return await fetchWithAuth(`${API_BASE}/points.php?action=search`, {
      method: 'POST',
      body: JSON.stringify({ phone })
    });
  };

  const transferPoints = async (toPhone, amount) => {
    if (!user) return { success: false, message: '请先登录' };
    const res = await fetchWithAuth(`${API_BASE}/points.php?action=transfer`, {
      method: 'POST',
      body: JSON.stringify({ from: user.phone, to: toPhone, amount })
    });
    if (res && res.success) {
      const updatedUser = { ...user, points: user.points - amount };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, openAuthDialog, openPointsDialog, searchUserByPhone, transferPoints }}>
      {children}
      <AuthDialog open={isAuthDialogOpen} onClose={() => setAuthDialogOpen(false)} />
      <PointsDialog open={isPointsDialogOpen} onClose={() => setPointsDialogOpen(false)} />
    </AuthContext.Provider>
  );
}
