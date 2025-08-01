import React, { createContext, useState, useEffect } from 'react';
import AuthDialog from '../components/AuthDialog';
// 修正 PointsDialog 的导入路径
import PointsDialog from '../games/thirteen/components/PointsDialog'; 
import { apiRequest } from '../utils/api'; 

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

  const login = async (username, password) => {
    try {
      const res = await apiRequest('/login.php', {
        method: 'POST',
        body: JSON.stringify({ username, password })
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

  const register = async (username, password) => {
    try {
      const res = await apiRequest('/register.php', {
        method: 'POST',
        body: JSON.stringify({ username, password })
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
  const closePointsDialog = () => setPointsDialogOpen(false);

  const searchUserByPhone = async (phone) => {
    // 实际应调用API
    console.log("Searching for phone:", phone);
    return { success: true, data: { id: '123', phone } };
  }

  const transferPoints = async (toPhone, amount) => {
    // 实际应调用API
    console.log(`Transferring ${amount} to ${toPhone}`);
    return { success: true, message: '积分赠送成功' };
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, openAuthDialog, openPointsDialog, searchUserByPhone, transferPoints }}>
      {children}
      <AuthDialog open={isAuthDialogOpen} onClose={() => setAuthDialogOpen(false)} />
      <PointsDialog open={isPointsDialogOpen} onClose={closePointsDialog} />
    </AuthContext.Provider>
  );
}
