import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// API base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const RegisterPage = () => {
    const navigate = useNavigate();

    // State vẫn giữ nguyên như lần cập nhật trước (không có Adafruit)
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        email: '',
        phone: '',
        username: '',
        password: '',
        password_confirmation: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        if (errorMessage) {
            setErrorMessage('');
        }
    };

    // --- CẬP NHẬT HÀM handleSubmit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');

        if (formData.password !== formData.password_confirmation) {
            setErrorMessage('Mật khẩu và xác nhận mật khẩu không khớp.');
            setIsLoading(false);
            return;
        }

        const dataToSubmit = new FormData();
        // Append các trường thông tin người dùng
        dataToSubmit.append('name', formData.name);
        dataToSubmit.append('gender', formData.gender);
        dataToSubmit.append('email', formData.email);
        dataToSubmit.append('phone', formData.phone);
        dataToSubmit.append('username', formData.username);
        dataToSubmit.append('password', formData.password);
        dataToSubmit.append('password_confirmation', formData.password_confirmation);

        // --- THÊM DỮ LIỆU GIẢ CHO ADAFRUIT ---
        // Gửi giá trị cố định để vượt qua validation backend
        // Bạn có thể thay đổi "not_used" nếu backend yêu cầu định dạng khác
        dataToSubmit.append('ada_username', 'not_used');
        dataToSubmit.append('ada_key', 'not_used');
        // -------------------------------------

        // Không có avatar

        try {
            console.log("Submitting registration data (with dummy Adafruit fields)...");
            const response = await axios.post(`${API_BASE_URL}/register`, dataToSubmit);

            console.log("Registration successful:", response.data);
            navigate('/login');

        } catch (err) {
            console.error("Registration failed:", err);
            let message = "Đăng ký thất bại. Vui lòng thử lại.";
            if (err.response) {
                console.error("Error response data:", err.response.data);
                console.error("Error response status:", err.response.status);
                if (err.response.data && err.response.data.message) {
                    message = err.response.data.message;
                } else if (err.response.status === 422 && err.response.data && err.response.data.errors) {
                     const errors = err.response.data.errors;
                     // Kiểm tra xem có lỗi liên quan đến Adafruit không (dù đã gửi giả)
                     if (errors.ada_username || errors.ada_key) {
                        message = "Có lỗi xảy ra với thông tin Adafruit phía máy chủ, dù đã gửi dữ liệu tạm.";
                     } else {
                         const errorMessages = Object.values(errors).flat();
                         message = `Thông tin không hợp lệ: ${errorMessages.join('. ')}`;
                     }
                 } else {
                     message = `Lỗi ${err.response.status}: ${err.response.statusText || 'Có lỗi xảy ra từ máy chủ.'}`;
                 }
            } else if (err.request) {
                console.error("Error request:", err.request);
                message = "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.";
            } else {
                console.error('Error', err.message);
                message = `Lỗi: ${err.message}`;
            }
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- PHẦN JSX GIỮ NGUYÊN NHƯ LẦN TRƯỚC ---
    // (Không hiển thị input cho Adafruit)
    return (
        <div className="min-h-screen bg-[#f9f9ef] flex flex-col">
            {/* Header */}
            <div className="p-4">
                <Link to="/" className="flex items-center text-[#3d7a3d] font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                         <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    HOME
                </Link>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-4">
                <div className="w-full max-w-lg bg-[#3d7a3d] p-8 md:p-10 text-white rounded-lg shadow-lg mb-8">
                    <h1 className="text-3xl font-bold text-center text-white mb-8">ĐĂNG KÝ</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-1">Tên</label>
                            <input id="name" type="text" name="name" placeholder="Nhập tên của bạn" value={formData.name} onChange={handleChange} required
                                   className="w-full bg-white/20 border border-white/30 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/70 text-white" />
                        </div>
                        {/* Gender */}
                         <div>
                            <label htmlFor="gender" className="block text-sm font-medium mb-1">Giới tính</label>
                            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required
                                    className="w-full bg-white/20 border border-white/30 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-white/50 text-white appearance-none">
                                <option value="" disabled className="text-gray-500">-- Chọn giới tính --</option>
                                <option value="male" className="text-black">Nam</option>
                                <option value="female" className="text-black">Nữ</option>
                                <option value="other" className="text-black">Khác</option>
                            </select>
                        </div>
                        {/* Email */}
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                            <input id="email" type="email" name="email" placeholder="Nhập địa chỉ email" value={formData.email} onChange={handleChange} required
                                   className="w-full bg-white/20 border border-white/30 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/70 text-white" />
                        </div>
                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium mb-1">Số điện thoại</label>
                            <input id="phone" type="tel" name="phone" placeholder="Nhập số điện thoại" value={formData.phone} onChange={handleChange} required
                                   className="w-full bg-white/20 border border-white/30 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/70 text-white" />
                        </div>
                        {/* Separator */}
                        <hr className="border-white/30 my-6" />
                        {/* Username */}
                         <div>
                            <label htmlFor="username" className="block text-sm font-medium mb-1">Tên đăng nhập</label>
                             <input id="username" type="text" name="username" placeholder="Chọn tên đăng nhập" value={formData.username} onChange={handleChange} required
                                    className="w-full bg-white/20 border border-white/30 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/70 text-white" />
                         </div>
                         {/* Password */}
                         <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-1">Mật khẩu</label>
                             <input id="password" type="password" name="password" placeholder="Nhập mật khẩu" value={formData.password} onChange={handleChange} required
                                    className="w-full bg-white/20 border border-white/30 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/70 text-white" />
                         </div>
                         {/* Password Confirmation */}
                         <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium mb-1">Xác nhận mật khẩu</label>
                             <input id="password_confirmation" type="password" name="password_confirmation" placeholder="Nhập lại mật khẩu" value={formData.password_confirmation} onChange={handleChange} required
                                    className="w-full bg-white/20 border border-white/30 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/70 text-white" />
                         </div>

                         {/* Error Display */}
                         {errorMessage && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                                <span className="block sm:inline">{errorMessage}</span>
                            </div>
                         )}

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button type="submit" disabled={isLoading}
                                    className="bg-white text-[#3d7a3d] py-3 px-6 rounded-md font-semibold w-full hover:bg-gray-200 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#3d7a3d]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        ĐANG XỬ LÝ...
                                    </div>
                                ) : 'ĐĂNG KÝ'}
                            </button>
                        </div>
                    </form>

                    {/* Login Link */}
                    <div className="text-center mt-6">
                         <span className="text-sm text-white/80">Đã có tài khoản? </span>
                         <Link to="/login" className="text-sm text-white hover:underline font-medium">
                            Đăng nhập ngay
                         </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;