// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';

// const LoginPage = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [rememberMe, setRememberMe] = useState(false);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Xử lý logic đăng nhập ở đây
//     console.log('Đăng nhập với:', { username, password, rememberMe });
    
//     // Nếu "Ghi nhớ tài khoản" được chọn, lưu thông tin vào localStorage
//     if (rememberMe) {
//       localStorage.setItem('rememberedUsername', username);
//     } else {
//       localStorage.removeItem('rememberedUsername');
//     }
//   };

//   // Kiểm tra localStorage khi component được tạo
//   React.useEffect(() => {
//     const savedUsername = localStorage.getItem('rememberedUsername');
//     if (savedUsername) {
//       setUsername(savedUsername);
//       setRememberMe(true);
//     }
//   }, []);

//   return (
//     <div className="min-h-screen bg-[#f9f9f0] flex flex-col">
//       {/* Header với nút quay lại */}
//       <div className="p-4">
//         <Link to="/" className="flex items-center text-green-700 hover:text-green-800">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//             <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
//           </svg>
//           HOME
//         </Link>
//       </div>

//       {/* Form đăng nhập */}
//       <div className="flex-grow flex items-center justify-center">
//         <div className="bg-[#3d8c40] rounded-3xl p-10 sm:p-20 w-full max-w-xl min-h-[450px] mx-4">
//           <h1 className="text-center text-white text-3xl font-bold mb-15">ĐĂNG NHẬP</h1>
          
//           <form onSubmit={handleSubmit}>
//             {/* Input tên đăng nhập */}
//             <div className="mb-4">
//               <div className="bg-white rounded-full flex items-center h-10">
//                 <div className="pl-4 pr-2">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Tên đăng nhập"
//                   className="w-full py-2 px-2 rounded-full focus:outline-none text-sm"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   required
//                 />
//               </div>
//             </div>
            
//             {/* Input mật khẩu */}
//             <div className="mb-2">
//               <div className="bg-white rounded-full flex items-center h-10">
//                 <div className="pl-4 pr-2">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <input
//                   type="password"
//                   placeholder="Mật khẩu"
//                   className="w-full py-2 px-2 rounded-full focus:outline-none text-sm"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>
//             </div>
            
//             {/* Checkbox ghi nhớ tài khoản */}
//             <div className="flex justify-between items-center mb-10">
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   id="rememberMe"
//                   checked={rememberMe}
//                   onChange={(e) => setRememberMe(e.target.checked)}
//                   className="mr-2"
//                 />
//                 <label htmlFor="rememberMe" className="text-white text-sm">
//                   Ghi nhớ tài khoản của tôi
//                 </label>
//               </div>
//               <Link to="/forgot-password" className="text-white text-sm hover:underline">
//                 Quên mật khẩu
//               </Link>
//             </div>
            
//             {/* Nút đăng nhập */}
//             <button
//               type="submit"
//               className="w-full bg-white text-[#3d8c40] font-bold py-2.5 rounded-full hover:bg-gray-100 focus:outline-none text-sm mb-4 mt-4"
//             >
//               ĐĂNG NHẬP
//             </button>
            
//             {/* Link đăng ký */}
//             <div className="text-center text-white text-sm mt-6">
//               <span>Bạn chưa có tài khoản? </span>
//               <Link to="/register" className="hover:underline font-medium">
//                 Đăng ký
//               </Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

// src/Pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { FiLoader } from 'react-icons/fi'; // Import icon loading

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Thêm state loading
    const [error, setError] = useState(''); // Thêm state error

    const { login } = useAuth(); // Lấy hàm login từ context
    const navigate = useNavigate(); // Hook để điều hướng

    // Lấy username đã lưu khi component mount
    useEffect(() => {
        const savedUsername = localStorage.getItem('rememberedUsername');
        if (savedUsername) {
            setUsername(savedUsername);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e) => { // Chuyển thành async
        e.preventDefault();
        setIsLoading(true); // Bắt đầu loading
        setError(''); // Reset lỗi

        try {
            // Gọi hàm login từ context
            await login(username, password);

            // Xử lý rememberMe sau khi đăng nhập thành công
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            // Đăng nhập thành công, chuyển hướng về trang chủ
            console.log("Login successful, navigating to /");
            navigate('/'); // Chuyển hướng

        } catch (err) {
            // Xử lý lỗi trả về từ hàm login trong context
            console.error("Login failed in component:", err);
            setError(err.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
            setIsLoading(false); // Dừng loading khi có lỗi
        }
        // Không cần setLoading(false) ở đây vì nếu thành công sẽ chuyển trang
    };


    return (
        <div className="min-h-screen bg-[#f9f9f0] flex flex-col">
            {/* Header với nút quay lại */}
            <div className="p-4">
                {/* Link về trang chủ có thể không phù hợp ở đây nếu trang chủ yêu cầu đăng nhập
                   Có thể bỏ nút này hoặc link về trang giới thiệu (nếu có) */}
                <Link to="/" className="flex items-center text-green-700 hover:text-green-800">
                    {/* ... svg icon ... */}
                    HOME {/* Hoặc tên khác phù hợp */}
                </Link>
            </div>

            {/* Form đăng nhập */}
            <div className="flex-grow flex items-center justify-center">
                <div className="bg-[#3d8c40] rounded-3xl p-10 sm:p-20 w-full max-w-xl min-h-[450px] mx-4">
                    <h1 className="text-center text-white text-3xl font-bold mb-10">ĐĂNG NHẬP</h1> {/* Tăng mb */}

                    <form onSubmit={handleSubmit}>
                        {/* Input tên đăng nhập */}
                        <div className="mb-4">
                            <div className="bg-white rounded-full flex items-center h-10">
                                {/* ... svg user icon ... */}
                                <input
                                    type="text"
                                    placeholder="Tên đăng nhập"
                                    className="w-full py-2 px-2 rounded-full focus:outline-none text-sm"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={isLoading} // Disable khi đang loading
                                />
                            </div>
                        </div>

                        {/* Input mật khẩu */}
                        <div className="mb-2">
                            <div className="bg-white rounded-full flex items-center h-10">
                                {/* ... svg lock icon ... */}
                                <input
                                    type="password"
                                    placeholder="Mật khẩu"
                                    className="w-full py-2 px-2 rounded-full focus:outline-none text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading} // Disable khi đang loading
                                />
                            </div>
                        </div>

                         {/* Hiển thị lỗi */}
                         {error && (
                             <p className="text-red-200 text-sm text-center mt-2 mb-2">{error}</p>
                         )}


                        {/* Checkbox và Quên mật khẩu */}
                        <div className="flex justify-between items-center mb-6 mt-4"> {/* Tăng mb, mt */}
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
                            disabled={isLoading} // Disable nút khi đang loading
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