// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken') || null);
    const [loading, setLoading] = useState(true);

    const verifyToken = useCallback(async () => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            console.log("Verifying stored token (using current mock logic)...");
            try {
                 await new Promise(resolve => setTimeout(resolve, 500));
                 const mockUser = JSON.parse(localStorage.getItem('authUser')) || { id: 1, name: 'Người dùng đã lưu' };
                 setUser(mockUser);
                 setToken(storedToken);
                 axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                 console.log("Token verified (mock), user set:", mockUser);

            } catch (error) {
                console.error("Token verification failed:", error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('authUser');
                setToken(null);
                setUser(null);
                delete axios.defaults.headers.common['Authorization'];
            }
        } else {
            console.log("No stored token found.");
        }
        setLoading(false);
    }, []);


    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    const login = async (username, password) => {
        console.log("Attempting login via API with:", { username });
        try {
            const response = await axios.post(`${API_BASE_URL}/login`, {
                username: username,
                password: password
            });

            console.log("API Login Response:", response);
            if (response.data && response.data.access_token && response.data.user) {
                const receivedToken = response.data.access_token; 
                const receivedUser = response.data.user;         
                const tokenType = response.data.token_type || 'Bearer'; 

                localStorage.setItem('authToken', receivedToken);
                localStorage.setItem('authUser', JSON.stringify(receivedUser));

                setToken(receivedToken);
                setUser(receivedUser);

                axios.defaults.headers.common['Authorization'] = `${tokenType} ${receivedToken}`;

                console.log("Login successful via API, token stored, user set:", receivedUser);
                console.log("Authorization header set with type:", tokenType);

                return receivedUser;
            } else {

                console.error("Login API responded successfully but without expected data (access_token or user).", response.data);
                throw new Error(response.data?.message || "Phản hồi từ máy chủ không hợp lệ sau khi đăng nhập.");
            }

        } catch (err) {
            console.error("Login failed:", err);

            let errorMessage = "Đã xảy ra lỗi khi đăng nhập.";
             if (err.response) {
                 errorMessage = err.response.data?.message || err.response.data?.detail || `Lỗi ${err.response.status}`;
                 if(err.response.status === 401 || err.response.status === 400 || err.response.status === 422) { 
                     errorMessage = err.response.data?.message || err.response.data?.detail || "Tên đăng nhập hoặc mật khẩu không chính xác.";
                 }
             } else if (err.request) {
                 errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.";
             } else {
                 errorMessage = err.message;
             }
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        console.log("Logging out...");
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setUser(null);
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
        console.log("Logged out, token and user removed from storage.");
    };
    const value = {
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};