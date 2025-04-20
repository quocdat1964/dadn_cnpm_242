import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      // Xử lý logic quên mật khẩu ở đây
      console.log('Gửi yêu cầu đặt lại mật khẩu cho:', email);
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f0] flex flex-col">
      {/* Header với nút quay lại */}
      <div className="p-4">
        <Link to="/login" className="flex items-center text-green-700 hover:text-green-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          ĐĂNG NHẬP
        </Link>
      </div>

      {/* Nội dung trang */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-[#3d8c40] rounded-3xl p-10 sm:p-16 w-full max-w-xl min-h-[380px] mx-4">
          <h1 className="text-center text-white text-3xl font-bold mb-8">QUÊN MẬT KHẨU</h1>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <p className="text-white text-center mb-6">
                  Vui lòng nhập địa chỉ email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.
                </p>
                
                {/* Input email */}
                <div className="bg-white rounded-full flex items-center h-10 mb-4">
                  <div className="pl-4 pr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full py-2 px-2 rounded-full focus:outline-none text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <p className="text-red-200 text-sm text-center mb-4">{error}</p>
                )}
              </div>
              
              {/* Nút gửi yêu cầu */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-[#3d8c40] font-bold py-2.5 rounded-full hover:bg-gray-100 focus:outline-none text-sm mb-6 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#3d8c40]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    ĐANG XỬ LÝ...
                  </>
                ) : (
                  'GỬI YÊU CẦU'
                )}
              </button>
              
              {/* Link đăng nhập */}
              <div className="text-center">
                <Link to="/login" className="text-white text-sm hover:underline">
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>
              <p className="text-white mb-8">
                Chúng tôi đã gửi email hướng dẫn đặt lại mật khẩu đến <strong>{email}</strong>. 
                Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
              </p>
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-white text-[#3d8c40] font-bold py-2.5 rounded-full hover:bg-gray-100 focus:outline-none text-sm mb-4"
              >
                QUAY LẠI ĐĂNG NHẬP
              </button>
              <p className="text-white text-sm mt-4">
                Không nhận được email? 
                <button 
                  onClick={() => setIsSubmitted(false)} 
                  className="underline ml-1 hover:text-gray-200"
                >
                  Thử lại
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;