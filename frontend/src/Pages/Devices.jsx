// // src/pages/Devices.jsx
// import React, { useState } from 'react';
// // Không import Sidebar
// import SettingsModal from '../Components/SettingModal';
// import DeviceCard from '../Components/DeviceCard';
// import ScheduleEntry from '../Components/ScheduleEntry';
// import {
//     FiSettings as PageSettingsIcon, // Đổi tên để tránh trùng
//     FiBell,
//     FiPlus,
//     // Không import FiMenu
//     FiPower,
//     FiZap, // Icon đèn
//     FiDroplet // Icon máy bơm
// } from 'react-icons/fi';

// // Dữ liệu giả lập ban đầu (Lấy lại từ bản gốc)
// const initialDevices = {
//   light1: { name: 'Đèn (Manual)', type: 'light', statusText: '30 LUX', isOn: false, settings: { color: '#ffffff' } },
//   pump1: { name: 'Máy bơm (Manual)', type: 'pump', statusText: '30%', isOn: true, settings: { speed: 30 } },
//   light2: { name: 'Đèn (Auto)', type: 'light', statusText: '30 LUX', settings: { color: '#fffacd' } },
//   pump2: { name: 'Máy bơm (Auto)', type: 'pump', statusText: '30%', settings: { speed: 50 } },
// };

// const initialSchedules = [
//     { id: 'sch1', deviceName: 'Đèn', deviceType: 'light', icon: FiZap, startTime: '8 am', endTime: '8 pm', isActive: true },
//     { id: 'sch2', deviceName: 'Máy bơm', deviceType: 'pump', icon: FiDroplet, startTime: '8 am', endTime: '8 pm', isActive: false },
// ]

// const Devices = () => {
//   // Không có state isSidebarOpen
//   const [devices, setDevices] = useState(initialDevices);
//   const [schedules, setSchedules] = useState(initialSchedules);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingDevice, setEditingDevice] = useState(null); // Lưu key của device đang sửa (vd: 'light2')

//   // Không có hàm toggleSidebar

//   // Xử lý bật/tắt thiết bị manual (Lấy lại từ bản gốc)
//   const handleManualToggle = (deviceId) => {
//     setDevices(prev => ({
//       ...prev,
//       [deviceId]: { ...prev[deviceId], isOn: !prev[deviceId].isOn }
//     }));
//     // TODO: Gửi API cập nhật trạng thái
//     console.log(`Toggled ${deviceId} to ${!devices[deviceId].isOn}`);
//   };

//   // Mở modal cài đặt (Lấy lại từ bản gốc)
//   const handleOpenSettings = (deviceId) => {
//     setEditingDevice(deviceId);
//     setIsModalOpen(true);
//   };

//   // Đóng modal (Lấy lại từ bản gốc)
//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setEditingDevice(null);
//   };

//   // Lưu cài đặt từ modal (Lấy lại từ bản gốc)
//   const handleSaveSettings = (deviceType, newSettings) => {
//     if (editingDevice) {
//       setDevices(prev => ({
//         ...prev,
//         [editingDevice]: { ...prev[editingDevice], settings: newSettings }
//       }));
//        // TODO: Gửi API cập nhật settings
//       console.log(`Saved settings for ${editingDevice}:`, newSettings);
//     }
//   };

//   // Xử lý bật/tắt lịch trình (Lấy lại từ bản gốc)
//   const handleScheduleToggle = (scheduleId) => {
//        setSchedules(prev => prev.map(sch =>
//            sch.id === scheduleId ? { ...sch, isActive: !sch.isActive } : sch
//        ));
//        // TODO: Gửi API cập nhật trạng thái lịch trình
//        const toggledSchedule = schedules.find(sch => sch.id === scheduleId);
//        console.log(`Toggled schedule ${scheduleId} to ${!toggledSchedule?.isActive}`); // Thêm ?. để tránh lỗi nếu không tìm thấy
//     };

//   // Tắt tất cả thiết bị (Manual) (Lấy lại từ bản gốc)
//   const handleTurnOffAll = () => {
//        setDevices(prev => {
//            const nextState = { ...prev };
//            Object.keys(nextState).forEach(key => {
//                // Sửa điều kiện kiểm tra tên để chính xác hơn
//                if (nextState[key].name.toLowerCase().includes('(manual)')) {
//                    nextState[key] = { ...nextState[key], isOn: false };
//                }
//            });
//            return nextState;
//        });
//        // TODO: Gửi API tắt tất cả thiết bị
//        console.log('Turning off all manual devices');
//   }

//   return (
//     // Sử dụng Fragment thay vì div bao ngoài
//     <>
//         {/* Header của trang Devices */}
//         <header className="flex items-center justify-between p-5 border-b bg-white sticky top-0 z-20">
//              <div className="flex items-center">
//                 {/* Không có nút toggle menu ở đây */}
//                 <h1 className="text-2xl font-bold text-gray-800">SMART TOMATO FARM</h1>
//              </div>
//              <div className="flex items-center space-x-4">
//                 <button className="text-gray-500 hover:text-gray-700">
//                     <PageSettingsIcon size={20} />
//                 </button>
//                 <button className="text-gray-500 hover:text-gray-700 relative">
//                     <FiBell size={20} />
//                 </button>
//              </div>
//         </header>

//         {/* Main Content Grid */}
//         <div className="p-6 flex-grow">
//              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//                 {/* Cột 1: Thủ công */}
//                 <section>
//                     <h2 className="text-xl font-semibold mb-4 text-gray-700">Thủ công</h2>
//                     <div className="space-y-4">
//                         {/* Truyền đủ props cho DeviceCard (Lấy lại từ bản gốc) */}
//                         <DeviceCard
//                             id="light1"
//                             deviceName={devices.light1.name}
//                             statusText={devices.light1.statusText}
//                             isManual={true}
//                             isDeviceOn={devices.light1.isOn}
//                             onToggleChange={() => handleManualToggle('light1')}
//                             // imageUrl="/path/to/light-icon.png" // Thêm URL hình ảnh nếu có
//                         />
//                         <DeviceCard
//                             id="pump1"
//                             deviceName={devices.pump1.name}
//                             statusText={devices.pump1.statusText}
//                             isManual={true}
//                             isDeviceOn={devices.pump1.isOn}
//                             onToggleChange={() => handleManualToggle('pump1')}
//                              // imageUrl="/path/to/pump-icon.png" // Thêm URL hình ảnh nếu có
//                         />
//                     </div>
//                 </section>

//                 {/* Cột 2: Tự động thông minh */}
//                 <section>
//                     <h2 className="text-xl font-semibold mb-4 text-gray-700">Tự động thông minh</h2>
//                     <div className="space-y-4">
//                          {/* Truyền đủ props cho DeviceCard (Lấy lại từ bản gốc) */}
//                         <DeviceCard
//                             id="light2"
//                             deviceName={devices.light2.name}
//                             statusText={devices.light2.statusText}
//                             isManual={false} // Hiện nút gear
//                             onSettingsClick={() => handleOpenSettings('light2')}
//                              // imageUrl="/path/to/light-icon.png"
//                         />
//                         <DeviceCard
//                             id="pump2"
//                             deviceName={devices.pump2.name}
//                             statusText={devices.pump2.statusText}
//                             isManual={false} // Hiện nút gear
//                             onSettingsClick={() => handleOpenSettings('pump2')}
//                              // imageUrl="/path/to/pump-icon.png"
//                         />
//                     </div>
//                 </section>

//                 {/* Cột 3: Hẹn giờ */}
//                 <section>
//                      <div className="flex justify-between items-center mb-4">
//                         <h2 className="text-xl font-semibold text-gray-700">Hẹn giờ ({schedules.filter(s => s.isActive).length})</h2>
//                         <button className="text-blue-600 hover:text-blue-800" aria-label="Thêm lịch trình">
//                              <FiPlus size={24} />
//                         </button>
//                      </div>
//                      <div className="bg-gray-200 p-4 rounded-lg shadow-inner space-y-3">
//                            {schedules.map(schedule => (
//                                // Truyền đủ props cho ScheduleEntry (Lấy lại từ bản gốc)
//                                <ScheduleEntry
//                                    key={schedule.id}
//                                    id={schedule.id}
//                                    deviceName={schedule.deviceName}
//                                    icon={schedule.icon}
//                                    startTime={schedule.startTime}
//                                    endTime={schedule.endTime}
//                                    isActive={schedule.isActive}
//                                    onToggle={() => handleScheduleToggle(schedule.id)}
//                                />
//                            ))}
//                            {schedules.length === 0 && ( <p className='text-center text-gray-500 text-sm'>Chưa có lịch trình nào.</p> )}
//                      </div>
//                 </section>
//              </div>

//              {/* Nút Turn Off All */}
//              <div className="mt-auto pt-6 text-center">
//                   <button
//                      onClick={handleTurnOffAll}
//                      className="w-full max-w-xs bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-lg shadow transition duration-200 flex items-center justify-center mx-auto"
//                   >
//                      <FiPower size={20} className="mr-2"/>
//                      Turn Off All Devices
//                   </button>
//              </div>
//         </div>

//         {/* Modal */}
//         <SettingsModal
//              isOpen={isModalOpen}
//              onClose={handleCloseModal}
//              deviceType={editingDevice ? devices[editingDevice]?.type : null}
//              deviceName={editingDevice ? devices[editingDevice]?.name : ''}
//              currentSettings={editingDevice ? devices[editingDevice]?.settings : {}}
//              onSave={handleSaveSettings}
//         />
//     </> // Đóng Fragment
//   );
// };

// export default Devices;

// src/pages/Devices.jsx
import React, { useState, Fragment } from 'react'; // Import Fragment
// Không import Sidebar
import SettingsModal from '../Components/SettingModal'; // Đảm bảo đường dẫn đúng
import DeviceCard from '../Components/DeviceCard';     // Đảm bảo đường dẫn đúng
import ScheduleEntry from '../Components/ScheduleEntry'; // Đảm bảo đường dẫn đúng
import {
    FiSettings as PageSettingsIcon,
    FiBell,
    FiPlus,
    FiPower,
    FiZap,      // Icon đèn (giả định)
    FiDroplet   // Icon máy bơm (giả định)
} from 'react-icons/fi';

// --- Dữ liệu khởi tạo ---
// Điều chỉnh dựa trên screenshot (tên đơn giản hơn, status text khác)
// Thêm isManual để phân biệt và id để dễ quản lý
const initialDevicesData = {
    light1: { id: 'light1', name: 'Đèn', type: 'light', statusText: 'Ánh sáng 30 LUX', isOn: false, isManual: true, settings: { threshold: 50 } }, // Thêm setting ví dụ
    pump1: { id: 'pump1', name: 'Máy bơm', type: 'pump', statusText: 'Độ ẩm đất 30 %', isOn: false, isManual: true, settings: { duration: 10 } }, // Thêm setting ví dụ, screenshot là OFF
    light2: { id: 'light2', name: 'Đèn', type: 'light', statusText: 'Ánh sáng 30 LUX', isManual: false, settings: { threshold: 70 } }, // Thiết bị tự động không cần trạng thái isOn trực tiếp ở đây
    pump2: { id: 'pump2', name: 'Máy bơm', type: 'pump', statusText: 'Độ ẩm đất 30 %', isManual: false, settings: { threshold: 40 } }, // Thêm setting ví dụ
};

const initialSchedulesData = [
    { id: 'sch1', deviceName: 'Đèn', deviceType: 'light', icon: FiZap, startTime: '8 pm', endTime: '8 am', isActive: true },
    { id: 'sch2', deviceName: 'Máy bơm', deviceType: 'pump', icon: FiDroplet, startTime: '8 pm', endTime: '8 am', isActive: true }, // Screenshot hiển thị cả 2 đang ON
];
// -------------------------

const Devices = () => {
    const [devices, setDevices] = useState(initialDevicesData);
    const [schedules, setSchedules] = useState(initialSchedulesData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeviceKey, setEditingDeviceKey] = useState(null); // Dùng key (vd: 'light2') để xác định device đang sửa

    // --- Hàm xử lý ---

    // Bật/tắt thiết bị thủ công
    const handleManualToggle = async (deviceKey) => {
        const deviceToToggle = devices[deviceKey];
        if (!deviceToToggle || !deviceToToggle.isManual) return; // Chỉ xử lý thiết bị manual

        const newIsOn = !deviceToToggle.isOn;
        // Cập nhật state trước (optimistic update)
        setDevices(prev => ({
            ...prev,
            [deviceKey]: { ...prev[deviceKey], isOn: newIsOn }
        }));

        try {
            console.log(`API CALL: Toggling ${deviceKey} to ${newIsOn}`);
            // await api.updateDeviceStatus(deviceKey, { isOn: newIsOn }); // Gọi API thật
        } catch (error) {
            console.error(`Failed to toggle ${deviceKey}:`, error);
            // Rollback state nếu API lỗi
            setDevices(prev => ({
                ...prev,
                [deviceKey]: { ...prev[deviceKey], isOn: !newIsOn } // Trả về trạng thái cũ
            }));
            // Hiện thông báo lỗi cho người dùng (nếu cần)
        }
    };

    // Mở modal cài đặt cho thiết bị tự động
    const handleOpenSettings = (deviceKey) => {
        if (devices[deviceKey] && !devices[deviceKey].isManual) {
            setEditingDeviceKey(deviceKey);
            setIsModalOpen(true);
        }
    };

    // Đóng modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDeviceKey(null);
    };

    // Lưu cài đặt từ modal
    const handleSaveSettings = async (deviceType, newSettings) => {
        if (!editingDeviceKey) return;

        const originalSettings = devices[editingDeviceKey]?.settings;
        // Cập nhật state trước
        setDevices(prev => ({
            ...prev,
            [editingDeviceKey]: { ...prev[editingDeviceKey], settings: newSettings }
        }));
        setIsModalOpen(false); // Đóng modal sau khi lưu

        try {
            console.log(`API CALL: Saving settings for ${editingDeviceKey}:`, newSettings);
            // await api.updateDeviceSettings(editingDeviceKey, newSettings); // Gọi API thật
            setEditingDeviceKey(null); // Xóa key đang sửa sau khi thành công
        } catch (error) {
            console.error(`Failed to save settings for ${editingDeviceKey}:`, error);
            // Rollback state nếu API lỗi
            setDevices(prev => ({
                ...prev,
                [editingDeviceKey]: { ...prev[editingDeviceKey], settings: originalSettings } // Trả về settings cũ
            }));
            setIsModalOpen(true); // Mở lại modal để người dùng biết lỗi? (tùy logic)
             // Hiện thông báo lỗi
        }
    };

    // Bật/tắt lịch trình
    const handleScheduleToggle = async (scheduleId) => {
        const scheduleIndex = schedules.findIndex(sch => sch.id === scheduleId);
        if (scheduleIndex === -1) return;

        const originalSchedule = schedules[scheduleIndex];
        const newIsActive = !originalSchedule.isActive;

        // Cập nhật state trước
        setSchedules(prev => prev.map(sch =>
            sch.id === scheduleId ? { ...sch, isActive: newIsActive } : sch
        ));

        try {
            console.log(`API CALL: Toggling schedule ${scheduleId} to ${newIsActive}`);
            // await api.updateScheduleStatus(scheduleId, { isActive: newIsActive }); // Gọi API thật
        } catch (error) {
            console.error(`Failed to toggle schedule ${scheduleId}:`, error);
            // Rollback state nếu API lỗi
            setSchedules(prev => prev.map(sch =>
                sch.id === scheduleId ? { ...sch, isActive: !newIsActive } : sch
            ));
             // Hiện thông báo lỗi
        }
    };

    // Thêm lịch trình (Placeholder)
    const handleAddSchedule = () => {
        console.log("API CALL: Request to add a new schedule");
        // Logic mở modal/form thêm lịch trình sẽ ở đây
        // Sau khi thêm thành công từ API, cập nhật lại state 'schedules'
    };

    // Tắt tất cả thiết bị thủ công
    const handleTurnOffAll = async () => {
        const manualDeviceKeys = Object.keys(devices).filter(key => devices[key]?.isManual && devices[key]?.isOn);
        if (manualDeviceKeys.length === 0) return; // Không có thiết bị nào đang bật

        const originalDevicesState = { ...devices }; // Lưu trạng thái gốc để rollback

        // Cập nhật state trước
        setDevices(prev => {
            const nextState = { ...prev };
            manualDeviceKeys.forEach(key => {
                nextState[key] = { ...nextState[key], isOn: false };
            });
            return nextState;
        });

        try {
            console.log('API CALL: Turning off all manual devices:', manualDeviceKeys);
            // await api.turnOffMultipleDevices(manualDeviceKeys); // Gọi API thật
        } catch (error) {
            console.error('Failed to turn off all devices:', error);
            // Rollback state nếu API lỗi
            setDevices(originalDevicesState);
            // Hiện thông báo lỗi
        }
    }
    // --------------------

    // Lấy thông tin device đang chỉnh sửa cho Modal
    const currentEditingDevice = editingDeviceKey ? devices[editingDeviceKey] : null;

    return (
        // Sử dụng Fragment vì không cần div bao ngoài nữa
        <Fragment>
            {/* Header của trang Devices */}
            <header className="flex items-center justify-between p-5 border-b bg-white sticky top-0 z-20">
                 <div className="flex items-center">
                    {/* Không có nút toggle menu ở đây */}
                    <h1 className="text-2xl font-bold text-gray-800">SMART TOMATO FARM</h1>
                 </div>
                 <div className="flex items-center space-x-4">
                    <button className="text-gray-500 hover:text-gray-700" title="Thông báo">
                        <FiBell size={20} />
                    </button>
                     <button className="text-gray-500 hover:text-gray-700" title="Cài đặt trang">
                        <PageSettingsIcon size={20} />
                    </button>
                 </div>
            </header>

            {/* Main Content Grid */}
            <div className="p-6 flex-grow">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                    {/* Cột 1: Thủ công */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Thủ công</h2>
                        <div className="space-y-4">
                            {/* Thêm optional chaining `?.` để an toàn khi truy cập state */}
                            <DeviceCard
                                id={devices.light1?.id}
                                deviceName={devices.light1?.name}
                                statusText={devices.light1?.statusText}
                                isManual={true}
                                isDeviceOn={devices.light1?.isOn}
                                onToggleChange={() => handleManualToggle('light1')}
                                // imageUrl="/images/light_manual.png" // Cập nhật ảnh nếu có
                            />
                            <DeviceCard
                                id={devices.pump1?.id}
                                deviceName={devices.pump1?.name}
                                statusText={devices.pump1?.statusText}
                                isManual={true}
                                isDeviceOn={devices.pump1?.isOn}
                                onToggleChange={() => handleManualToggle('pump1')}
                                // imageUrl="/images/pump_manual.png" // Cập nhật ảnh nếu có
                            />
                        </div>
                    </section>

                    {/* Cột 2: Tự động thông minh */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Tự động thông minh</h2>
                        <div className="space-y-4">
                            <DeviceCard
                                id={devices.light2?.id}
                                deviceName={devices.light2?.name}
                                statusText={devices.light2?.statusText}
                                isManual={false} // Hiện nút gear
                                onSettingsClick={() => handleOpenSettings('light2')}
                                // imageUrl="/images/light_auto.png" // Cập nhật ảnh nếu có
                            />
                            <DeviceCard
                                id={devices.pump2?.id}
                                deviceName={devices.pump2?.name}
                                statusText={devices.pump2?.statusText}
                                isManual={false} // Hiện nút gear
                                onSettingsClick={() => handleOpenSettings('pump2')}
                                // imageUrl="/images/pump_auto.png" // Cập nhật ảnh nếu có
                            />
                        </div>
                    </section>

                    {/* Cột 3: Hẹn giờ */}
                    <section>
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Hẹn giờ ({schedules.filter(s => s.isActive).length})</h2>
                            <button
                                onClick={handleAddSchedule}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100"
                                aria-label="Thêm lịch trình"
                                title="Thêm lịch trình"
                            >
                                 <FiPlus size={24} />
                            </button>
                         </div>
                         <div className="bg-gray-100 p-4 rounded-lg shadow-inner space-y-3 border border-gray-200"> {/* Thêm style nhẹ nhàng */}
                               {schedules.map(schedule => (
                                   <ScheduleEntry
                                       key={schedule.id}
                                       id={schedule.id}
                                       deviceName={schedule.deviceName}
                                       icon={schedule.icon} // Truyền icon từ data
                                       startTime={schedule.startTime}
                                       endTime={schedule.endTime}
                                       isActive={schedule.isActive}
                                       onToggle={() => handleScheduleToggle(schedule.id)}
                                       // Thêm các hàm xử lý edit/delete nếu cần
                                       // onEdit={() => handleEditSchedule(schedule.id)}
                                       // onDelete={() => handleDeleteSchedule(schedule.id)}
                                   />
                               ))}
                               {schedules.length === 0 && (
                                   <p className='text-center text-gray-500 text-sm py-4'>Chưa có lịch trình nào.</p>
                               )}
                         </div>
                    </section>
                 </div>

                 {/* Nút Turn Off All Devices */}
                 <div className="mt-auto pt-6 text-center">
                      <button
                         onClick={handleTurnOffAll}
                         className="w-full max-w-xs bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-lg shadow transition duration-200 flex items-center justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                         disabled={!Object.values(devices).some(d => d.isManual && d.isOn)} // Disable nếu không có thiết bị manual nào đang bật
                      >
                         <FiPower size={20} className="mr-2"/>
                         Turn Off All Devices
                      </button>
                 </div>
            </div>

            {/* Modal Cài đặt (truyền thông tin device đang sửa) */}
            <SettingsModal
                 isOpen={isModalOpen}
                 onClose={handleCloseModal}
                 // Sử dụng ?. để tránh lỗi nếu currentEditingDevice là null
                 deviceType={currentEditingDevice?.type}
                 deviceName={currentEditingDevice?.name}
                 currentSettings={currentEditingDevice?.settings || {}} // Đảm bảo settings là object
                 onSave={handleSaveSettings}
            />
        </Fragment>
    );
};

export default Devices;