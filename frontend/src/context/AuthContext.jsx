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

  const login = async (username, password) => { // 将phone改为username
    try {
      const res = await apiRequest('/login.php', {
        method: 'POST',
        body: JSON.stringify({ username, password }) // 将phone改为username
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

  const register = async (username, password) => { // 将phone改为username
    try {
      const res = await apiRequest('/register.php', {
        method: 'POST',
        body: JSON.stringify({ username, password }) // 将phone改为username
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

  // --- 暂时禁用的积分管理功能 ---
  // const searchUserByPhone = async (phone) => {
  //   try {
  //       return await apiRequest('/points.php?action=search', {
  //           method: 'POST',
  //           body: JSON.stringify({ phone }) // 此处保留phone，因为搜索可能仍按手机号
  //       });
  //   } catch (error) {
  //       return { success: false, message: error.message };
  //   }
  // };

  // const transferPoints = async (toPhone, amount) => {
  //   if (!user) return { success: false, message: '请先登录' };
  //   try {
  //       const res = await apiRequest('/points.php?action=transfer', {
  //           method: 'POST',
  //           body: JSON.stringify({ from: user.phone, to: toPhone, amount })
  //       });
  //       if (res && res.success) {
  //           const updatedUser = { ...user, points: user.points - amount };
  //           setUser(updatedUser);
  //           localStorage.setItem('user', JSON.stringify(updatedUser));
  //       }
  //       return res;
  //   } catch (error) {
  //       return { success: false, message: error.message };
  //   }
  // };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, openAuthDialog, openPointsDialog }}>
      {children}
      <AuthDialog open={isAuthDialogOpen} onClose={() => setAuthDialogOpen(false)} />
      <PointsDialog open={isPointsDialogOpen} onClose={() => setPointsDialogOpen(false)} />
    </AuthContext.Provider>
  );
}
