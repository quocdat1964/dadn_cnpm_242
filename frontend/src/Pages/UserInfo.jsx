// src/pages/UserInfo.jsx
import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';
import {
    FiSettings as PageSettingsIcon,
    FiBell,
    FiEdit,
    FiMail,
    FiPhone,
    FiUser,
    FiSave,
    FiXCircle,
    FiLoader,
} from 'react-icons/fi';

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
            {children ? (
                <div className="text-sm text-gray-800 col-span-2">{children}</div>
            ) : (
                <p className="text-sm text-gray-800 col-span-2 break-words">{value || 'N/A'}</p>
            )}
        </div>
    );
};


const UserInfo = () => {
    const [userData, setUserData] = useState(null);
    const [activityLogs, setActivityLogs] = useState([]);
    const [formData, setFormData] = useState({});
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [isEditingAccount, setIsEditingAccount] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { token } = useAuth();
    useEffect(() => {
        const fetchData = async () => {
            if (refreshTrigger === 0) {
                setLoading(true);
                setUserData(null);
                setActivityLogs([]);
            } else {
                console.log("Refreshing data...");
            }
            setError(null);
            setSuccessMessage(null);

            const fetchProfile = async () => {
                try {
                    const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    if (!response.ok) {
                        let errorMsg = `Lỗi lấy thông tin người dùng: ${response.status}`;
                        try {
                            const errorData = await response.json();
                            errorMsg += ` - ${errorData.message || 'Không có thông báo lỗi cụ thể'}`;
                        } catch (e) { }
                        if (response.status === 401) errorMsg = "Lỗi xác thực: Token không hợp lệ hoặc đã hết hạn.";
                        else if (response.status === 403) errorMsg = "Lỗi phân quyền: Bạn không có quyền truy cập thông tin này.";
                        throw new Error(errorMsg);
                    }
                    const data = await response.json();
                    return {
                        id: data.id, name: data.name, gender: data.gender,
                        startDate: data.created_at, email: data.email, phone: data.phone,
                        avatarUrl: data.avatar, username: data.username,
                        ada_username: data.ada_username, ada_key: data.ada_key, updated_at: data.updated_at
                    };
                } catch (error) {
                    console.error("Error in fetchProfile:", error);
                    if (error.message.includes('Failed to fetch')) throw new Error("Lỗi mạng khi lấy thông tin người dùng.");
                    throw error;
                }
            };

            const fetchLogs = async () => {
                try {
                    const response = await fetch('http://127.0.0.1:8000/api/activity-logs');
                    if (!response.ok) throw new Error(`Lỗi ${response.status} khi lấy nhật ký hoạt động.`);
                    const data = await response.json();
                    if (data.success && Array.isArray(data.data)) {
                        return data.data.map(log => ({
                            id: log.id, time: log.created_at,
                            device: log.device_name, message: log.message
                        }));
                    } else {
                        throw new Error(data.message || "Không thể xử lý dữ liệu nhật ký hoạt động.");
                    }
                } catch (error) {
                    console.error("Error in fetchLogs:", error);
                    if (error.message.includes('Failed to fetch')) throw new Error("Lỗi mạng khi lấy nhật ký hoạt động.");
                    throw error;
                }
            };

            try {
                const [profileData, logsData] = await Promise.all([
                    fetchProfile(),
                    fetchLogs()
                ]);
                setUserData(profileData);
                setActivityLogs(logsData);
            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
                if (refreshTrigger === 0) {
                    setUserData(null);
                    setActivityLogs([]);
                }
            } finally {

                if (refreshTrigger === 0) {
                    setLoading(false);
                } else {
                    console.log("Data refresh complete.");
                }
            }
        };

        fetchData();

    }, [refreshTrigger]);
    const handleEditClick = (section) => {
        if (!userData) return;
        setError(null);
        setSuccessMessage(null);

        if (section === 'info') {
            setFormData({
                name: userData.name,
                gender: userData.gender,
            });
            setIsEditingInfo(true);
            setIsEditingAccount(false);
        } else if (section === 'account') {
            setFormData({
                username: userData.username,
            });
            setIsEditingAccount(true);
            setIsEditingInfo(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingInfo(false);
        setIsEditingAccount(false);
        setFormData({});
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleSave = async (section) => {
        if (section !== 'info') {
            console.warn(`Save functionality for section "${section}" not implemented.`);
            return;
        }

        if (!formData.name && !formData.gender) {
            setError("Không có thay đổi để lưu.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    gender: formData.gender
                })
            });

            if (!response.ok) {
                let errorMsg = `Lỗi cập nhật thông tin: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = `${errorData.message || errorMsg}`;
                    if (response.status === 422 && errorData.errors) {
                        const validationErrors = Object.values(errorData.errors).flat().join(' ');
                        errorMsg = `Dữ liệu không hợp lệ: ${validationErrors}`;
                    }
                } catch (e) { }

                if (response.status === 401) errorMsg = "Lỗi xác thực khi cập nhật. Vui lòng đăng nhập lại.";
                else if (response.status === 403) errorMsg = "Không có quyền cập nhật thông tin này.";

                throw new Error(errorMsg);
            }

            let updatedProfileData = userData;
            try {
                if (response.status !== 204) {
                    updatedProfileData = await response.json();
                }
            } catch (e) {
                console.warn("Could not parse JSON response after PUT, using optimistic update.");
                updatedProfileData = { ...userData, ...formData };
            }

            const mappedUpdatedUserData = {
                ...userData,
                id: updatedProfileData.id || userData.id,
                name: updatedProfileData.name,
                gender: updatedProfileData.gender,
                updated_at: updatedProfileData.updated_at || new Date().toISOString(),
            };
            setUserData(mappedUpdatedUserData);


            setSuccessMessage("Cập nhật thông tin thành công!");
            handleCancelEdit();
            setRefreshTrigger(count => count + 1);

        } catch (err) {
            console.error(`Failed to update ${section}:`, err);
            setError(err.message || `Không thể cập nhật ${section}. Vui lòng thử lại.`);
        } finally {
            setIsSubmitting(false);
        }
    };


    if (loading) {
        return (
            <div className="flex w-full h-full items-center justify-center bg-gray-100">
                <FiLoader className="animate-spin text-blue-500 mr-3" size={40} />
                <span>Đang tải dữ liệu người dùng...</span>
            </div>
        );
    }

    if (error && !userData && !loading) {
        let errorTitle = "Lỗi tải dữ liệu";
        if (error.includes("401") || error.includes("xác thực")) errorTitle = "Yêu cầu đăng nhập";
        else if (error.includes("403") || error.includes("phân quyền")) errorTitle = "Truy cập bị từ chối";

        return (
            <div className="flex flex-col w-full h-full items-center justify-center bg-red-50 text-red-700 p-10">
                <h2 className="text-lg font-semibold mb-2">{errorTitle}</h2>
                <p className="text-center">{error}</p>
                {(error.includes("401") || error.includes("xác thực")) && (
                    <button
                        onClick={() => { alert("Chuyển đến trang đăng nhập..."); }}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    > Đăng nhập lại </button>
                )}
            </div>
        )
    }

    return (
        <Fragment>
            {/* Header */}
            <header className="flex items-center justify-between p-5 border-b bg-white static top-0 z-20">
                <div className="flex items-center">
                    <h1 className="text-xl font-semibold text-gray-800">Thông tin người dùng</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="text-gray-500 hover:text-gray-700"><PageSettingsIcon size={20} /></button>
                    <button className="text-gray-500 hover:text-gray-700 relative"><FiBell size={20} /></button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="p-6 flex-grow bg-gray-50">
                {error && !isSubmitting && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded text-sm">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 border border-green-300 rounded text-sm">
                        {successMessage}
                    </div>
                )}
                {userData ? (
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        {/* Left Side: Profile Overview */}
                        <section className="flex-shrink-0 lg:w-1/3 xl:w-1/4 flex flex-col items-center text-center bg-white p-6 rounded-lg shadow-md">
                            {/* ... profile overview content (using userData) ... */}
                            {userData.avatarUrl ? (<img src={userData.avatarUrl} alt="User Avatar" className="w-32 h-32 rounded-full mb-4 object-cover border-2 border-gray-300 shadow-sm" onError={(e) => { /*...*/ }} />)
                                : (<div className="w-32 h-32 rounded-full mb-4 bg-gray-200 flex items-center justify-center border-2 border-gray-300"><FiUser size={60} className="text-gray-400" /></div>)}
                            <h2 className="text-xl font-semibold text-gray-800">{userData.name}</h2>
                            <div className="mt-3 text-sm text-gray-600 space-y-1 w-full">
                                <p className="flex items-center justify-center break-words"><FiMail size={14} className="mr-2 flex-shrink-0" /> <span>{userData.email}</span></p>
                                <p className="flex items-center justify-center"><FiPhone size={14} className="mr-2 flex-shrink-0" /> {userData.phone || 'Chưa cập nhật'}</p>
                            </div>
                        </section>

                        {/* Right Side: Details & Logs */}
                        <section className="flex-1 space-y-8">
                            {/* User Information Section */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                {/* ... User Info content (edit/save buttons) ... */}
                                <div className="flex justify-between items-center mb-4 pb-2 border-b">
                                    <h3 className="text-lg font-semibold text-gray-700">Thông tin cá nhân</h3>
                                    {!isEditingInfo ? (<button onClick={() => handleEditClick('info')} className="text-blue-600 hover:text-blue-800" aria-label="Chỉnh sửa"><FiEdit size={18} /></button>)
                                        : (<div className="flex space-x-3">
                                            <button onClick={handleCancelEdit} className="text-gray-600 hover:text-gray-800" aria-label="Hủy"><FiXCircle size={20} /></button>
                                            <button onClick={() => handleSave('info')} className="text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Lưu" disabled={isSubmitting}>{isSubmitting ? <FiLoader className="animate-spin" size={20} /> : <FiSave size={20} />}</button>
                                        </div>)}
                                </div>
                                <ProfileField label="Họ và tên" name="name" value={isEditingInfo ? formData.name : userData.name} isEditing={isEditingInfo} onChange={handleInputChange} />
                                <ProfileField label="Giới tính" name="gender" value={isEditingInfo ? formData.gender : userData.gender} isEditing={isEditingInfo} onChange={handleInputChange} />
                                <ProfileField label="Ngày tham gia" value={userData.startDate ? dayjs(userData.startDate).format('DD/MM/YYYY') : 'N/A'} readOnly={true} isEditing={isEditingInfo} />
                            </div>

                            {/* Activity Logs Section */}
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Nhật ký hoạt động</h3>

                                <div className="overflow-x-auto overflow-y-auto max-h-96 border border-gray-200 rounded">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">

                                        <thead className="bg-gray-100 sticky top-0 z-10">
                                            <tr>
                                                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">
                                                    Thời gian
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">
                                                    Thiết bị
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">
                                                    Hành động
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {activityLogs.length > 0 ? activityLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                                                        {dayjs(log.time).format('HH:mm DD/MM/YYYY')}
                                                    </td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-gray-800">
                                                        {log.device}
                                                    </td>

                                                    <td className="px-4 py-2 text-gray-800 whitespace-normal break-words">
                                                        {log.message}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="3" className='text-center py-6 text-gray-500'>
                                                        Không có nhật ký hoạt động nào.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </div>
                ) : (
                    !loading && <p className="text-center text-gray-500">Không có thông tin người dùng để hiển thị.</p>
                )}
            </div>
        </Fragment>
    );
};

export default UserInfo;