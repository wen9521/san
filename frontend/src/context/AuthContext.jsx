import React, { createContext, useState, useEffect } from 'react';
import AuthDialog from '../components/AuthDialog';
import PointsDialog from '../components/PointsDialog';
import { apiRequest } from '../utils/api'; // 【核心】: 引入我们新的API请求函数

export const AuthContext = createContext();

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
    try {
      const res = await apiRequest('/login.php', { // 注意这里的修改：增加了斜杠
        method: 'POST',
        body: JSON.stringify({ phone, password })
      });
      if (res && res.success) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        setAuthDialogOpen(false);
      }
      return res;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (phone, password) => {
    try {
      const res = await apiRequest('/register.php', { // 注意这里的修改：增加了斜杠
        method: 'POST',
        body: JSON.stringify({ phone, password })
      });
      if (res && res.success) {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        setAuthDialogOpen(false);
      }
      return res;
    } catch (error) {
       return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const openAuthDialog = () => setAuthDialogOpen(true);
  const openPointsDialog = () => setPointsDialogOpen(true);

  const searchUserByPhone = async (phone) => {
    try {
        return await apiRequest('/points.php?action=search', { // 注意这里的修改：增加了斜杠
            method: 'POST',
            body: JSON.stringify({ phone })
        });
    } catch (error) {
        return { success: false, message: error.message };
    }
  };

  const transferPoints = async (toPhone, amount) => {
    if (!user) return { success: false, message: '请先登录' };
    try {
        const res = await apiRequest('/points.php?action=transfer', { // 注意这里的修改：增加了斜杠
            method: 'POST',
            body: JSON.stringify({ from: user.phone, to: toPhone, amount })
        });
        if (res && res.success) {
            const updatedUser = { ...user, points: user.points - amount };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return res;
    } catch (error) {
        return { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, openAuthDialog, openPointsDialog, searchUserByPhone, transferPoints }}>
      {children}
      <AuthDialog open={isAuthDialogOpen} onClose={() => setAuthDialogOpen(false)} />
      <PointsDialog open={isPointsDialogOpen} onClose={() => setPointsDialogOpen(false)} />
    </AuthContext.Provider>
  );
}
