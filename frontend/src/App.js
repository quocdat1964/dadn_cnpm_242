// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import các trang
import HomePage from './Pages/HomePage';
import Devices from './Pages/Devices';
import Data from './Pages/Data';
import UserInfo from './Pages/UserInfo';
import LoginPage from './Pages/LoginPage';
import RegisterPage from './Pages/RegisterPage';
import ForgotPasswordPage from './Pages/ForgotPasswordPage';

import Sidebar from './Components/Sidebar';
import { FiMenu, FiLoader } from 'react-icons/fi';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar cho mobile */}
                <header className="bg-white shadow-md lg:hidden">
                    <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                        <span className="text-xl font-semibold text-gray-700">My App</span>
                        <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none focus:text-gray-700" aria-label="Toggle menu">
                            <FiMenu size={24} />
                        </button>
                    </div>
                </header>
                {/* Nội dung trang sẽ được render vào <Outlet /> */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

// Component bảo vệ Route cho các trang yêu cầu đăng nhập
const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        // Hiển thị loading trong khi kiểm tra token ban đầu
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
                <FiLoader className="animate-spin text-blue-500 mr-3" size={40} />
                <span>Đang kiểm tra đăng nhập...</span>
            </div>
        );
    }

    // Nếu đã kiểm tra xong và chưa đăng nhập, chuyển hướng về /login
    if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login...");
        return <Navigate to="/login" replace />; 
    }
    return <AppLayout />;
};

// Component cho các trang công khai (Login, Register, ForgotPassword)
// Nếu đã đăng nhập thì chuyển hướng về trang chính
const PublicRoute = ({ element }) => {
    const { isAuthenticated, loading } = useAuth();

     if (loading) {
         return (
             <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
                 <FiLoader className="animate-spin text-blue-500 mr-3" size={40} />
             </div>
         );
    }
    // Nếu đã đăng nhập, chuyển hướng về trang chủ
    if (isAuthenticated) {
        console.log("Already authenticated, redirecting to home...");
        return <Navigate to="/" replace />;
    }
    return element;
};


function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Routes công khai */}
                    <Route path="/login" element={<PublicRoute element={<LoginPage />} />} />
                    <Route path="/register" element={<PublicRoute element={<RegisterPage />} />} />
                    <Route path="/forgot-password" element={<PublicRoute element={<ForgotPasswordPage />} />} />

                    {/* Routes yêu cầu đăng nhập */}
                    {/* Sử dụng ProtectedRoute làm layout chung */}
                    <Route element={<ProtectedRoute />}>
                        {/* Các trang con sẽ được render vào <Outlet /> của AppLayout */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/devices" element={<Devices />} />
                        <Route path="/data" element={<Data />} />
                        <Route path="/user" element={<UserInfo />} />
                        {/* Thêm các route được bảo vệ khác ở đây */}
                    </Route>
                     <Route path="*" element={<Navigate to={localStorage.getItem('authToken') ? "/" : "/login"} replace />} />

                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;