import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate

const ForgotPasswordPage = () => {
  const navigate = useNavigate(); // Để điều hướng đến trang đăng nhập

  // State cho bước 1: Yêu cầu email
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false); // Đã gửi yêu cầu email thành công?

  // State cho bước 2: Nhập token và mật khẩu mới
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState(''); // Thông báo thành công cuối cùng

  // State chung cho UI
  const [isLoading, setIsLoading] = useState(false); // Dùng chung cho cả 2 API calls
  const [error, setError] = useState(''); // Dùng chung, xóa trước mỗi lần gọi API

  // --- HÀM XỬ LÝ BƯỚC 1: GỬI YÊU CẦU EMAIL ---
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResetSuccessMessage(''); // Xóa thông báo thành công cũ nếu thử lại

    try {
      const response = await fetch('http://127.0.0.1:8000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: email }),
      });

      if (response.ok) {
        setIsSubmitted(true); // Chuyển sang bước 2: hiển thị form nhập token/mật khẩu
      } else {
        let errorMessage = `Có lỗi xảy ra. Mã lỗi: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || JSON.stringify(errorData);
        } catch (jsonError) {
           console.error("Không thể parse JSON lỗi từ response:", jsonError);
        }
        setError(`Không thể gửi yêu cầu: ${errorMessage}`);
        setIsSubmitted(false); // Giữ nguyên ở form nhập email nếu lỗi
      }
    } catch (networkError) {
      console.error('Lỗi mạng hoặc fetch:', networkError);
      setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      setIsSubmitted(false);
    } finally {
      setIsLoading(false);
    }
  };

  // --- HÀM XỬ LÝ BƯỚC 2: ĐẶT LẠI MẬT KHẨU ---
  const handleResetPasswordSubmit = async (e) => {
      e.preventDefault();
      setError(''); // Xóa lỗi cũ
      setResetSuccessMessage(''); // Xóa thông báo thành công cũ

      // Kiểm tra cơ bản
      if (!token) {
          setError('Vui lòng nhập mã token từ email.');
          return;
      }
      if (!password || !passwordConfirmation) {
          setError('Vui lòng nhập mật khẩu mới và xác nhận mật khẩu.');
          return;
      }
      if (password !== passwordConfirmation) {
          setError('Mật khẩu và xác nhận mật khẩu không khớp.');
          return;
      }

      setIsLoading(true);

      try {
          const response = await fetch('http://127.0.0.1:8000/api/reset-password', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
              },
              body: JSON.stringify({
                  email: email, // Sử dụng email đã nhập ở bước 1
                  token: token,
                  password: password,
                  password_confirmation: passwordConfirmation,
              }),
          });

          let responseData;
          try {
                responseData = await response.json();
          } catch(jsonError) {
                responseData = null;
                console.error("Không thể parse JSON response:", jsonError);
          }

          if (response.ok) {
              // Thành công cuối cùng
              setResetSuccessMessage(responseData?.message || 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.');
              // Có thể xóa các trường không cần thiết nữa
              // setToken('');
              // setPassword('');
              // setPasswordConfirmation('');
          } else {
              // Xử lý lỗi từ API đặt lại mật khẩu
              let errorMessage = `Lỗi ${response.status}.`;
               if (responseData && responseData.message) {
                   errorMessage = responseData.message;
               } else if (responseData && responseData.errors) {
                   errorMessage = Object.values(responseData.errors).flat().join(' ');
               } else if (responseData) {
                    errorMessage = JSON.stringify(responseData);
               } else {
                  const errorText = await response.text();
                  errorMessage = errorText || `Yêu cầu thất bại với mã trạng thái ${response.status}`;
               }
              setError(`Đặt lại mật khẩu thất bại: ${errorMessage}`);
          }
      } catch (networkError) {
          console.error('Lỗi mạng hoặc fetch:', networkError);
          setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
      } finally {
          setIsLoading(false);
      }
  };


  return (
    <div className="min-h-screen bg-[#f9f9f0] flex flex-col">
      {/* Header với nút quay lại Đăng nhập */}
      {!resetSuccessMessage && ( // Ẩn header quay lại khi đã thành công cuối cùng
          <div className="p-4">
              <Link to="/login" className="flex items-center text-green-700 hover:text-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  ĐĂNG NHẬP
              </Link>
          </div>
      )}

      {/* Nội dung trang */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-[#3d8c40] rounded-3xl p-10 sm:p-16 w-full max-w-xl min-h-[480px] mx-4"> {/* Tăng min-height */}
          <h1 className="text-center text-white text-3xl font-bold mb-8">
             {resetSuccessMessage ? 'THÀNH CÔNG' : 'QUÊN MẬT KHẨU'}
          </h1>

          {/* --- GIAO DIỆN BƯỚC 1: NHẬP EMAIL --- */}
          {!isSubmitted && (
            <form onSubmit={handleRequestSubmit}>
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
                    type="email" placeholder="Email"
                    className="w-full py-2 px-2 rounded-full focus:outline-none text-sm"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    required disabled={isLoading}
                  />
                </div>
                {/* Hiển thị lỗi bước 1 */}
                {error && <p className="text-red-200 text-sm text-center mb-4">{error}</p>}
              </div>
              {/* Nút gửi yêu cầu email */}
              <button type="submit" disabled={isLoading}
                className={`w-full bg-white text-[#3d8c40] font-bold py-2.5 rounded-full hover:bg-gray-100 focus:outline-none text-sm mb-6 flex items-center justify-center ${isLoading ? 'cursor-not-allowed opacity-75' : ''}`}>
                {isLoading ? ( <> {/* Spinner */}ĐANG XỬ LÝ...</> ) : ( 'GỬI YÊU CẦU' )}
              </button>
              {/* Link đăng nhập */}
              <div className="text-center">
                <Link to="/login" className="text-white text-sm hover:underline">
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}

          {/* --- GIAO DIỆN BƯỚC 2: NHẬP TOKEN & MẬT KHẨU MỚI (HIỂN THỊ SAU KHI isSubmitted=true VÀ CHƯA thành công cuối cùng) --- */}
          {isSubmitted && !resetSuccessMessage && (
            <div>
                 {/* Thông báo đã gửi email */}
                 <div className="text-center text-white mb-6 p-3 bg-green-600 rounded-lg shadow">
                      <div className="flex justify-center mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                            </svg>
                      </div>
                     <p>Chúng tôi đã gửi email hướng dẫn đến <strong>{email}</strong>.</p>
                     <p className="text-sm mt-1">Vui lòng kiểm tra hộp thư (cả thư mục spam), lấy mã Token và nhập vào form dưới đây cùng mật khẩu mới.</p>
                 </div>

                 {/* Form nhập token và mật khẩu mới */}
                 <form onSubmit={handleResetPasswordSubmit}>
                      {/* Input Token */}
                      <div className="mb-4">
                         <label className="block text-white text-sm font-bold mb-2" htmlFor="token">Mã Token từ Email</label>
                          <div className="bg-white rounded-full flex items-center h-10">
                               <div className="pl-4 pr-2"> {/* Icon Hashtag/Token */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                    </svg>
                               </div>
                               <input id="token" type="text" placeholder="Nhập mã token bạn nhận được"
                                  className="w-full py-2 px-2 rounded-full focus:outline-none text-sm"
                                  value={token} onChange={(e) => setToken(e.target.value)}
                                  required disabled={isLoading} />
                          </div>
                      </div>

                      {/* Input Mật khẩu mới */}
                      <div className="mb-4">
                         <label className="block text-white text-sm font-bold mb-2" htmlFor="password">Mật khẩu mới</label>
                          <div className="bg-white rounded-full flex items-center h-10">
                               <div className="pl-4 pr-2"> {/* Icon Key */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /> </svg>
                               </div>
                               <input id="password" type="password" placeholder="Nhập mật khẩu mới"
                                  className="w-full py-2 px-2 rounded-full focus:outline-none text-sm"
                                  value={password} onChange={(e) => setPassword(e.target.value)}
                                  required disabled={isLoading} />
                          </div>
                      </div>

                      {/* Input Xác nhận mật khẩu */}
                      <div className="mb-6">
                         <label className="block text-white text-sm font-bold mb-2" htmlFor="password_confirmation">Xác nhận mật khẩu mới</label>
                          <div className="bg-white rounded-full flex items-center h-10">
                               <div className="pl-4 pr-2"> {/* Icon Key */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /> </svg>
                               </div>
                               <input id="password_confirmation" type="password" placeholder="Nhập lại mật khẩu mới"
                                  className="w-full py-2 px-2 rounded-full focus:outline-none text-sm"
                                  value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)}
                                  required disabled={isLoading} />
                          </div>
                      </div>

                     {/* Hiển thị lỗi bước 2 */}
                     {error && <p className="text-red-200 text-sm text-center mb-4">{error}</p>}

                     {/* Nút submit đặt lại mật khẩu */}
                     <button type="submit" disabled={isLoading}
                         className={`w-full bg-white text-[#3d8c40] font-bold py-2.5 rounded-full hover:bg-gray-100 focus:outline-none text-sm mb-6 flex items-center justify-center ${isLoading ? 'cursor-not-allowed opacity-75' : ''}`}>
                         {isLoading ? ( <> {/* Spinner */} ĐANG LƯU MẬT KHẨU...</> ) : ( 'ĐẶT LẠI MẬT KHẨU' )}
                     </button>
                 </form>

                 {/* Tùy chọn thử lại bước 1 (nếu không nhận được email/token) */}
                  <p className="text-white text-sm text-center mt-4">
                     Không nhận được email/token?
                     <button
                       onClick={() => {
                           setIsSubmitted(false); // Quay lại bước 1
                           setError('');         // Xóa lỗi
                           // Giữ lại email đã nhập hoặc xóa đi tùy ý: setEmail('');
                       }}
                       className="underline ml-1 hover:text-gray-200 focus:outline-none"
                     >
                       Gửi lại yêu cầu
                     </button>
                   </p>
             </div>
          )}

          {/* --- GIAO DIỆN THÀNH CÔNG CUỐI CÙNG --- */}
          {resetSuccessMessage && (
                <div className="text-center">
                    <div className="flex justify-center mb-6"> {/* Icon Check Mark */}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-white text-lg mb-8">{resetSuccessMessage}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-white text-[#3d8c40] font-bold py-2.5 rounded-full hover:bg-gray-100 focus:outline-none text-sm"
                    >
                        ĐẾN TRANG ĐĂNG NHẬP
                    </button>
                </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;