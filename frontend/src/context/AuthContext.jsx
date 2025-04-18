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
            // TODO: Thêm logic gọi API để xác thực token với backend
            // Ví dụ:
            // try {
            //    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            //    const response = await axios.get('/api/auth/me'); // Endpoint lấy thông tin user từ token
            //    setUser(response.data);
            //    setToken(storedToken);
            //    console.log("Token verified, user set:", response.data);
            // } catch (error) {
            //    console.error("Token verification failed:", error);
            //    localStorage.removeItem('authToken'); // Xóa token nếu không hợp lệ
            //    setToken(null);
            //    setUser(null);
            //    delete axios.defaults.headers.common['Authorization'];
            // }

            // ----- GIẢ LẬP VERIFY TOKEN (Tạm thời) -----
            // Giả sử token cũ vẫn hợp lệ và lấy thông tin user giả lập
             await new Promise(resolve => setTimeout(resolve, 500)); // Giả lập gọi API
             const mockUser = { id: 1, name: 'Người dùng đã lưu', email: 'saved@example.com' }; // Thông tin user giả lập
             setUser(mockUser);
             setToken(storedToken);
             axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`; // Thiết lập header cho các request sau
             console.log("Token verified (mock), user set:", mockUser);
            // --------------------------------------------

        } else {
            console.log("No stored token found.");
        }
        setLoading(false); // Kết thúc kiểm tra ban đầu
    }, []);

    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    // Hàm đăng nhập
    const login = async (username, password) => {
        console.log("Attempting login with:", { username }); // Không log password
        try {
            // --- GIẢ LẬP API LOGIN ---
            await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập độ trễ
            // Giả sử đăng nhập thành công nếu username/password là 'admin'/'admin'
            if (username === 'admin' && password === 'admin') {
                const mockToken = 'fake-jwt-token-' + Date.now();
                const mockUser = { id: 1, name: 'Admin User', email: 'admin@example.com' };

                localStorage.setItem('authToken', mockToken); // Lưu token
                setToken(mockToken);
                setUser(mockUser);
                axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`; // Thiết lập header
                console.log("Login successful (mock)");
                return mockUser; // Trả về user data nếu cần
            } else {
                throw new Error("Tên đăng nhập hoặc mật khẩu không đúng.");
            }
            // --- KẾT THÚC GIẢ LẬP ---

            /*
            // --- API Call Thật ---
            const response = await axios.post('/api/auth/login', { username, password }); // Thay endpoint
            const { token: receivedToken, user: userData } = response.data;

            localStorage.setItem('authToken', receivedToken);
            setToken(receivedToken);
            setUser(userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`; // Thiết lập header
            console.log("Login successful");
            return userData;
            */

        } catch (err) {
            console.error("Login failed:", err);
            // Xử lý lỗi cụ thể từ API nếu có
            const errorMessage = err.response?.data?.message || err.message || "Đã xảy ra lỗi khi đăng nhập.";
            // Ném lỗi ra để component LoginPage có thể bắt và hiển thị
            throw new Error(errorMessage);
        }
    };

    // Hàm đăng xuất
    const logout = () => {
        console.log("Logging out...");
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
        // Chuyển hướng sẽ được xử lý bởi ProtectedRoute hoặc component gọi logout
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token, // Trạng thái đăng nhập dựa trên sự tồn tại của token
        loading, // Trạng thái kiểm tra token ban đầu
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook tùy chỉnh để sử dụng AuthContext dễ dàng hơn
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};