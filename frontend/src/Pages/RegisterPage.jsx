import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    adafruitUsername: '',
    adafruitKey: '',
    avatar: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      avatar: e.target.files[0]
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log(formData);
  };

  return (
    <div className="min-h-screen bg-[#f9f9ef] flex flex-col">
      {/* Header with back button */}
      <div className="p-4">
        <Link to="/" className="flex items-center text-[#3d7a3d] font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          HOME
        </Link>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-[#3d7a3d] my-6">ĐĂNG KÝ</h1>
        
        <div className="w-full max-w-4xl flex flex-col md:flex-row mb-8">
          {/* Left section - Personal Information */}
          <div className="w-full md:w-1/2 bg-[#3d7a3d] p-8 text-white rounded-l-lg">
            <h2 className="text-xl mb-6 font-medium">Thông tin cá nhân</h2>
            
            <div className="space-y-6">
              <input
                type="text"
                name="name"
                placeholder="Tên"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/70 pb-2 focus:outline-none placeholder-white/50 text-white"
              />
              
              <input
                type="text"
                name="gender"
                placeholder="Giới tính"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/70 pb-2 focus:outline-none placeholder-white/50 text-white"
              />
              
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/70 pb-2 focus:outline-none placeholder-white/50 text-white"
              />
              
              <input
                type="tel"
                name="phone"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/70 pb-2 focus:outline-none placeholder-white/50 text-white"
              />
            </div>
            
            <h2 className="text-xl mt-10 mb-6 font-medium">Thông tin tài khoản</h2>
            
            <div className="space-y-6">
              <input
                type="text"
                name="username"
                placeholder="Tên đăng nhập"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/70 pb-2 focus:outline-none placeholder-white/50 text-white"
              />
              
              <input
                type="password"
                name="password"
                placeholder="Mật khẩu"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/70 pb-2 focus:outline-none placeholder-white/50 text-white"
              />
            </div>
            
            <div className="mt-14">
              <button 
                onClick={handleSubmit}
                className="bg-white text-[#3d7a3d] py-3 px-6 rounded-md font-medium w-full hover:bg-gray-100 transition"
              >
                ĐĂNG KÝ
              </button>
            </div>
          </div>
          
          {/* Right section - Avatar and Adafruit */}
          <div className="w-full md:w-1/2 bg-white p-8 flex flex-col items-center justify-center rounded-r-lg">
            <div className="flex flex-col items-center mb-18">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                {formData.avatar ? (
                  <img 
                    src={URL.createObjectURL(formData.avatar)} 
                    alt="Avatar preview" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <label className="bg-gray-200 text-gray-600 py-2 px-4 rounded-md cursor-pointer hover:bg-gray-300 transition">
                Upload Avatar
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
            
            <div className="w-full pt-8 max-w-sm">
              <h2 className="text-center text-gray-700 mb-6">Adafruit.IO Server</h2>
              
              <div className="space-y-4">
                <input
                  type="text"
                  name="adafruitUsername"
                  placeholder="username"
                  value={formData.adafruitUsername}
                  onChange={handleChange}
                  className="w-full bg-gray-200 rounded-md p-3 focus:outline-none"
                />
                
                <input
                  type="text"
                  name="adafruitKey"
                  placeholder="key"
                  value={formData.adafruitKey}
                  onChange={handleChange}
                  className="w-full bg-gray-200 rounded-md p-3 focus:outline-none"
                />
              </div>
              {/* Terms and conditions checkbox */}
              <div className="flex items-start mt-4 mb-3">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 mr-2"
                />
                <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                  Tôi đã đọc và đồng ý với <a href="#" className="text-[#3d7a3d] hover:underline">điều khoản sử dụng</a> và <a href="#" className="text-[#3d7a3d] hover:underline">chính sách bảo mật</a>
                </label>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;