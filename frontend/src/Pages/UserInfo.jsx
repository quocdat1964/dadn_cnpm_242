// src/pages/UserInfo.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../Components/Sidebar';
import axios from 'axios'; // Or use fetch
import dayjs from 'dayjs';
import {
    FiSettings as PageSettingsIcon,
    FiBell,
    FiMenu,
    FiEdit,
    FiMail,
    FiPhone,
    FiUser, // Placeholder for avatar if no image
    FiSave,
    FiXCircle, // Cancel icon
    FiLoader, // Loading icon
    FiEye,
    FiEyeOff
} from 'react-icons/fi';

// Component nhỏ để hiển thị trường thông tin (có thể tách file riêng)
const ProfileField = ({ label, value, name, isEditing, onChange, inputType = 'text', readOnly = false, children }) => {
    if (isEditing && !readOnly) {
        return (
            <div className="grid grid-cols-3 gap-4 items-center mb-3">
                <label htmlFor={name} className="text-sm font-medium text-gray-600 col-span-1">
                    {label}:
                </label>
                <input
                    type={inputType}
                    id={name}
                    name={name}
                    value={value || ''}
                    onChange={onChange}
                    className="col-span-2 p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
            </div>
        );
    }
    return (
        <div className="grid grid-cols-3 gap-4 items-center mb-3">
            <p className="text-sm font-medium text-gray-600 col-span-1">{label}:</p>
            {/* Children ưu tiên hiển thị nếu có (vd: cho password với icon mắt) */}
            {children ? (
                 <div className="text-sm text-gray-800 col-span-2">{children}</div>
            ) : (
                 <p className="text-sm text-gray-800 col-span-2">{value || 'N/A'}</p>
            )}

        </div>
    );
};


const UserInfo = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userData, setUserData] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);
    const [formData, setFormData] = useState({}); // Dữ liệu tạm thời khi sửa
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading khi submit
    const [showPassword, setShowPassword] = useState(false);


    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Fetch initial data
    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            setError(null);
            try {
                // --- GIẢ LẬP API GET USER DATA ---
                await new Promise(resolve => setTimeout(resolve, 1000));
                const mockUserData = {
                    id: 1,
                    name: 'Nguyen Quoc Dat',
                    gender: 'Male',
                    startDate: '2025-03-28', // Format YYYY-MM-DD
                    email: 'abcdef@gmail.com',
                    phone: '0123456789',
                    avatarUrl: null, // Hoặc 'https://via.placeholder.com/150'
                    username: 'nguyenquocdathcmut',
                    // Không nên fetch password
                };
                const mockLogs = [
                    { id: 1, time: '2025-03-28 12:30', device: 'Led RGB', message: 'Change led color to blue' },
                    { id: 2, time: '2025-03-28 11:00', device: 'Máy bơm', message: 'Turn on pump' },
                    { id: 3, time: '2025-03-27 18:00', device: 'Led RGB', message: 'Set brightness to 80%' },
                ];
                // --- KẾT THÚC GIẢ LẬP ---

                /*
                // --- API Call Thật ---
                const userResponse = await axios.get('/api/user/profile'); // Thay endpoint
                const logsResponse = await axios.get('/api/user/activity-logs'); // Thay endpoint
                setUserData(userResponse.data);
                setActivityLogs(logsResponse.data);
                */

                setUserData(mockUserData);
                setActivityLogs(mockLogs);

            } catch (err) {
                console.error("Failed to fetch user data:", err);
                setError("Không thể tải thông tin người dùng.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    // Hàm xử lý khi nhấn nút sửa
    const handleEditClick = (section) => {
        if (!userData) return;
        setError(null); // Clear error cũ
        setSuccessMessage(null); // Clear success message cũ

        if (section === 'info') {
            // Copy dữ liệu cần sửa vào formData
            setFormData({
                name: userData.name,
                gender: userData.gender,
                // Thêm các trường khác nếu cần sửa
            });
            setIsEditingInfo(true);
            setIsEditingAccount(false); // Đảm bảo chỉ 1 section được sửa 1 lúc
        } else if (section === 'account') {
             setFormData({
                username: userData.username,
                // Password không sửa trực tiếp ở đây
             });
            setIsEditingAccount(true);
            setIsEditingInfo(false);
        }
    };

    // Hàm xử lý khi nhấn nút hủy
    const handleCancelEdit = () => {
        setIsEditingInfo(false);
        setIsEditingAccount(false);
        setFormData({}); // Reset form data
        setError(null);
    };

    // Hàm xử lý khi thay đổi input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Hàm xử lý khi lưu (chung, gọi hàm cụ thể)
    const handleSave = async (section) => {
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // --- GIẢ LẬP API UPDATE ---
            await new Promise(resolve => setTimeout(resolve, 1500));
             // Kiểm tra dữ liệu gửi đi (ví dụ)
             console.log(`Updating ${section} with data:`, formData);
            // Giả lập thành công
            const updatedUserData = { ...userData, ...formData };
            // --- KẾT THÚC GIẢ LẬP ---

            /*
            // --- API Call Thật ---
            let response;
            if (section === 'info') {
                response = await axios.put('/api/user/profile', { // Thay endpoint
                    name: formData.name,
                    gender: formData.gender,
                     // Gửi các trường khác đã sửa
                });
            } else if (section === 'account') {
                 response = await axios.put('/api/user/account', { // Thay endpoint
                    username: formData.username,
                 });
            }
             const updatedUserData = response.data; // Lấy dữ liệu mới từ API (nếu có)
            */


            // Cập nhật state sau khi thành công
            setUserData(updatedUserData);
            setSuccessMessage("Cập nhật thông tin thành công!");
            handleCancelEdit(); // Thoát chế độ edit

        } catch (err) {
             console.error(`Failed to update ${section}:`, err);
             // Hiển thị lỗi cụ thể hơn nếu API trả về message lỗi
             const apiErrorMessage = err.response?.data?.message || `Không thể cập nhật ${section}. Vui lòng thử lại.`;
             setError(apiErrorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };


    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
                <FiLoader className="animate-spin text-blue-500 mr-3" size={40} />
                <span>Đang tải...</span>
            </div>
        );
    }

     if (error && !userData) { // Lỗi nghiêm trọng không tải được dữ liệu ban đầu
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-red-100 text-red-700 p-10">
                 <p><strong>Lỗi:</strong> {error}</p>
            </div>
        )
     }


    return (
        <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} activeItem="USER" />

            <main className="flex-1 flex flex-col overflow-y-auto">
                {/* Standard Header */}
                <header className="flex items-center justify-between p-5 border-b bg-white sticky top-0 z-20">
                    <div className="flex items-center">
                        <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900 focus:outline-none lg:hidden mr-4" aria-label="Open sidebar">
                            <FiMenu size={24} />
                        </button>
                        {/* Có thể thêm tiêu đề trang ở đây nếu muốn */}
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-500 hover:text-gray-700">
                            <PageSettingsIcon size={20} />
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 relative">
                            <FiBell size={20} />
                        </button>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="p-6 flex-grow">
                    {/* Thông báo lỗi/thành công */}
                    {error && !isSubmitting && ( // Chỉ hiển thị lỗi nếu không phải đang submit
                        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
                            {error}
                        </div>
                    )}
                     {successMessage && (
                        <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded text-sm">
                            {successMessage}
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        {/* Left Side: Profile Overview */}
                        <section className="flex-shrink-0 lg:w-1/4 flex flex-col items-center text-center bg-white p-6 rounded-lg shadow">
                           {userData?.avatarUrl ? (
                                <img
                                    src={userData.avatarUrl}
                                    alt="User Avatar"
                                    className="w-32 h-32 rounded-full mb-4 object-cover border-2 border-gray-300"
                                />
                           ) : (
                                <div className="w-32 h-32 rounded-full mb-4 bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                                    <FiUser size={60} className="text-gray-500" />
                                </div>
                           )}
                            <h2 className="text-xl font-semibold text-gray-800">{userData?.name}</h2>
                            <div className="mt-3 text-sm text-gray-600 space-y-1">
                                <p className="flex items-center justify-center">
                                    <FiMail className="mr-2" /> {userData?.email}
                                </p>
                                <p className="flex items-center justify-center">
                                    <FiPhone className="mr-2" /> {userData?.phone || 'Chưa cập nhật'}
                                </p>
                            </div>
                        </section>

                        {/* Right Side: Details & Logs */}
                        <section className="flex-1 space-y-8">
                             {/* User Information Section */}
                             <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                                    <h3 className="text-lg font-semibold text-gray-700">User Information</h3>
                                    {!isEditingInfo ? (
                                        <button onClick={() => handleEditClick('info')} className="text-blue-600 hover:text-blue-800" aria-label="Edit User Information">
                                            <FiEdit size={18} />
                                        </button>
                                    ) : (
                                         <div className="flex space-x-3">
                                             <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-800" aria-label="Cancel Edit">
                                                <FiXCircle size={20} />
                                            </button>
                                            <button onClick={() => handleSave('info')} className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Save User Information" disabled={isSubmitting}>
                                                {isSubmitting ? <FiLoader className="animate-spin" size={20}/> : <FiSave size={20} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <ProfileField label="Name" name="name" value={isEditingInfo ? formData.name : userData?.name} isEditing={isEditingInfo} onChange={handleInputChange} />
                                <ProfileField label="Gender" name="gender" value={isEditingInfo ? formData.gender : userData?.gender} isEditing={isEditingInfo} onChange={handleInputChange} />
                                <ProfileField label="Started date" value={userData ? dayjs(userData.startDate).format('DD - MM - YYYY') : 'N/A'} readOnly={true} isEditing={isEditingInfo} />
                             </div>

                             {/* Account Detail Section */}
                             <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                                    <h3 className="text-lg font-semibold text-gray-700">Account Detail</h3>
                                     {!isEditingAccount ? (
                                        <button onClick={() => handleEditClick('account')} className="text-blue-600 hover:text-blue-800" aria-label="Edit Account Detail">
                                            <FiEdit size={18} />
                                        </button>
                                     ) : (
                                         <div className="flex space-x-3">
                                             <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-800" aria-label="Cancel Edit">
                                                <FiXCircle size={20} />
                                            </button>
                                            <button onClick={() => handleSave('account')} className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Save Account Detail" disabled={isSubmitting}>
                                                {isSubmitting ? <FiLoader className="animate-spin" size={20}/> : <FiSave size={20} />}
                                            </button>
                                        </div>
                                     )}
                                </div>
                                <ProfileField label="Username" name="username" value={isEditingAccount ? formData.username : userData?.username} isEditing={isEditingAccount} onChange={handleInputChange} />
                                {/* Password Field - Display Only with toggle */}
                                <ProfileField label="Password" readOnly={true} isEditing={isEditingAccount}>
                                     <div className="flex items-center justify-between">
                                        <span>{showPassword ? 'Mật khẩu hiện tại' : '******'}</span> {/* Không hiển thị pass thật */}
                                        <button onClick={() => setShowPassword(!showPassword)} className='text-gray-500 hover:text-gray-700 ml-2'>
                                            {showPassword ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                                        </button>
                                     </div>
                                </ProfileField>
                                {/* Thêm nút "Đổi mật khẩu" riêng biệt ở đây nếu cần */}
                                {/* {!isEditingAccount && <button className='text-sm text-blue-600 hover:underline mt-2'>Đổi mật khẩu</button>} */}
                             </div>

                             {/* Activity Logs Section */}
                             <div className="bg-white p-6 rounded-lg shadow">
                                 <h3 className="text-lg font-semibold text-gray-700 mb-4">Activity Logs</h3>
                                 <div className="overflow-x-auto"> {/* Cho phép cuộn ngang trên màn hình nhỏ */}
                                     <table className="min-w-full divide-y divide-gray-200 text-sm">
                                         <thead className="bg-gray-50">
                                             <tr>
                                                 <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                                 <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Device</th>
                                                 <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Message</th>
                                             </tr>
                                         </thead>
                                         <tbody className="bg-white divide-y divide-gray-200">
                                             {activityLogs.length > 0 ? activityLogs.map((log) => (
                                                 <tr key={log.id}>
                                                     <td className="px-4 py-2 whitespace-nowrap text-gray-600">{dayjs(log.time).format('YYYY-MM-DD HH:mm')}</td>
                                                     <td className="px-4 py-2 whitespace-nowrap text-gray-800">{log.device}</td>
                                                     <td className="px-4 py-2 text-gray-800">{log.message}</td>
                                                 </tr>
                                             )) : (
                                                <tr>
                                                    <td colSpan="3" className='text-center py-4 text-gray-500'>Không có nhật ký hoạt động nào.</td>
                                                </tr>
                                             )}
                                         </tbody>
                                     </table>
                                 </div>
                             </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserInfo;