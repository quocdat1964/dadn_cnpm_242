// src/Pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLoader } from 'react-icons/fi';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(''); 

        try {
            await login(username, password);
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            console.log("Login successful, navigating to /");
            navigate('/');

        } catch (err) {
            console.error("Login failed in component:", err);
            setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-[#f9f9f0] flex flex-col">
            {/* Header với nút quay lại */}
            <div className="p-4">
                <Link to="/" className="flex items-center text-green-700 hover:text-green-800">
                    HOME 
                </Link>
            </div>

            {/* Form đăng nhập */}
            <div className="flex-grow flex items-center justify-center">
                <div className="bg-[#3d8c40] rounded-3xl p-10 sm:p-20 w-full max-w-xl min-h-[450px] mx-4">
                    <h1 className="text-center text-white text-3xl font-bold mb-10">ĐĂNG NHẬP</h1>

                    <form onSubmit={handleSubmit}>
                        {/* Input tên đăng nhập */}
                        <div className="mb-4">
                            <div className="bg-white rounded-full flex items-center h-10">
                                <input
                                    type="text"
                                    placeholder="Tên đăng nhập"
                                    className="w-full py-2 px-2 rounded-full focus:outline-none text-sm"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Input mật khẩu */}
                        <div className="mb-2">
                            <div className="bg-white rounded-full flex items-center h-10">
                                <input
                                    type="password"
                                    placeholder="Mật khẩu"
                                    className="w-full py-2 px-2 rounded-full focus:outline-none text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                         {/* Hiển thị lỗi */}
                         {error && (
                             <p className="text-red-200 text-sm text-center mt-2 mb-2">{error}</p>
                         )}


                        {/* Checkbox và Quên mật khẩu */}
                        <div className="flex justify-between items-center mb-6 mt-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="mr-2"
                                    disabled={isLoading}
                                />
                                <label htmlFor="rememberMe" className="text-white text-sm">
                                    Ghi nhớ tài khoản
                                </label>
                            </div>
                            <Link to="/forgot-password" className={`text-white text-sm hover:underline ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
                                Quên mật khẩu
                            </Link>
                        </div>

                        {/* Nút đăng nhập */}
                        <button
                            type="submit"
                            className="w-full bg-white text-[#3d8c40] font-bold py-2.5 rounded-full hover:bg-gray-100 focus:outline-none text-sm mb-4 mt-4 flex items-center justify-center disabled:opacity-70"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    ĐANG ĐĂNG NHẬP...
                                </>
                            ) : (
                                'ĐĂNG NHẬP'
                            )}
                        </button>

                        {/* Link đăng ký */}
                        <div className="text-center text-white text-sm mt-6">
                            <span>Bạn chưa có tài khoản? </span>
                            <Link to="/register" className={`hover:underline font-medium ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
                                Đăng ký
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;