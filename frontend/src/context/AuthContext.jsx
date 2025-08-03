import React, { createContext, useState, useContext } from 'react';
import { login as apiLogin, register as apiRegister } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const userData = await apiLogin(username, password);
            if (userData && userData.id) {
                setUser(userData);
                return true;
            }
            setError('登录失败：用户名或密码错误。');
            return false;
        } catch (err) {
            setError(`登录时发生错误: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const success = await apiRegister(username, password);
            if (success) {
                return true;
            }
            setError('注册失败：该用户名可能已被使用。');
            return false;
        } catch (err) {
            setError(`注册时发生错误: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
