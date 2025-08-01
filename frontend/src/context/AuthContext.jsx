import React, { createContext, useState, useEffect } from 'react';
import AuthDialog from '../components/AuthDialog';
// import PointsDialog from '../components/PointsDialog'; // Removed this line
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

  return (
    <AuthContext.Provider value={{ user, login, register, logout, openAuthDialog, openPointsDialog }}>
      {children}
      <AuthDialog open={isAuthDialogOpen} onClose={() => setAuthDialogOpen(false)} />
      {/* <PointsDialog open={isPointsDialogOpen} onClose={() => setPointsDialogOpen(false)} /> */}
    </AuthContext.Provider>
  );
}
