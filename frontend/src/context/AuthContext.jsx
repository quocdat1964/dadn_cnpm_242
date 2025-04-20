// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios'; // Hoặc dùng fetch

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Lưu thông tin user nếu đăng nhập thành công
    const [token, setToken] = useState(localStorage.getItem('authToken') || null); // Lấy token từ localStorage nếu có
    const [loading, setLoading] = useState(true); // State loading để kiểm tra trạng thái đăng nhập ban đầu

    // Hàm này sẽ được gọi khi component mount để kiểm tra token cũ
    const verifyToken = useCallback(async () => {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            console.log("Verifying stored token...");
            // Giả sử token cũ vẫn hợp lệ và lấy thông tin user giả lập
             await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập gọi API
             const mockUser = { id: 1, name: 'Người dùng đã lưu', email: 'saved@example.com' }; // Thông tin user giả lập
             setUser(mockUser);
             setToken(storedToken);
             axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
             console.log("Token verified (mock), user set:", mockUser);

        } else {
            console.log("No stored token found.");
        }
        setLoading(false); 
    }, []);

    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    // Hàm đăng nhập
    const login = async (username, password) => {
        console.log("Attempting login with:", { username });
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            // Giả sử đăng nhập thành công nếu username/password là 'admin'/'admin'
            if (username === 'admin' && password === 'admin') {
                const mockToken = 'fake-jwt-token-' + Date.now();
                const mockUser = { id: 1, name: 'Admin User', email: 'admin@example.com' };

                localStorage.setItem('authToken', mockToken);
                setToken(mockToken);
                setUser(mockUser);
                axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
                console.log("Login successful (mock)");
                return mockUser;
            } else {
                throw new Error("Tên đăng nhập hoặc mật khẩu không đúng.");
            }

        } catch (err) {
            console.error("Login failed:", err);
            const errorMessage = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi đăng nhập.";
            throw new Error(errorMessage);
        }
    };
    const logout = () => {
        console.log("Logging out...");
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
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