import { createContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Verify token or get user profile if endpoint exists
                    // For now, we trust the token presence + decode or just persist user state
                    // A better approach is /api/auth/me to get user data
                    // Here we will just set user if we had it stored or decode token
                    // For simplicity in this stack, let's assume we store user in localstorage too or just 'true'
                    // A more robust way:
                    const userData = JSON.parse(localStorage.getItem('user'));
                    if (userData) {
                        setUser(userData);
                    }
                } catch (error) {
                    console.error(error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        checkUserLoggedIn();
    }, []);

    const login = async (email, password, adminSecretKey) => {
        const { data } = await API.post('/auth/login', { email, password, adminSecretKey });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
    };

    const signup = async (username, email, password) => {
        const { data } = await API.post('/auth/signup', { username, email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const forgotPassword = async (email) => {
        return await API.post('/auth/forgotpassword', { email });
    };

    const resetPassword = async (token, password) => {
        return await API.put(`/auth/resetpassword/${token}`, { password });
    };

    const updateUserAvatar = (newAvatar) => {
        const updatedUser = { ...user, avatar: newAvatar };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, forgotPassword, resetPassword, updateUserAvatar, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
