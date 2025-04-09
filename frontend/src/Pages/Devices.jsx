// src/pages/Devices.jsx
import React, { useState } from 'react';
import Sidebar from '../Components/Sidebar';
import SettingsModal from '../Components/SettingModal';
import DeviceCard from '../Components/DeviceCard';
import ScheduleEntry from '../Components/ScheduleEntry';
import {
    FiSettings as PageSettingsIcon, // Đổi tên để tránh trùng
    FiBell,
    FiPlus,
    FiMenu,
    FiPower,
    FiZap, // Icon đèn
    FiDroplet // Icon máy bơm
} from 'react-icons/fi';

// Dữ liệu giả lập ban đầu
const initialDevices = {
  light1: { name: 'Đèn (Manual)', type: 'light', statusText: '30 LUX', isOn: false, settings: { color: '#ffffff' } },
  pump1: { name: 'Máy bơm (Manual)', type: 'pump', statusText: '30%', isOn: true, settings: { speed: 30 } },
  light2: { name: 'Đèn (Auto)', type: 'light', statusText: '30 LUX', settings: { color: '#fffacd' } },
  pump2: { name: 'Máy bơm (Auto)', type: 'pump', statusText: '30%', settings: { speed: 50 } },
};

const initialSchedules = [
    { id: 'sch1', deviceName: 'Đèn', deviceType: 'light', icon: FiZap, startTime: '8 am', endTime: '8 pm', isActive: true },
    { id: 'sch2', deviceName: 'Máy bơm', deviceType: 'pump', icon: FiDroplet, startTime: '8 am', endTime: '8 pm', isActive: false },
]

const Devices = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [devices, setDevices] = useState(initialDevices);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null); // Lưu key của device đang sửa (vd: 'light2')

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Xử lý bật/tắt thiết bị manual
  const handleManualToggle = (deviceId) => {
    setDevices(prev => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], isOn: !prev[deviceId].isOn }
    }));
    // TODO: Gửi API cập nhật trạng thái
    console.log(`Toggled ${deviceId} to ${!devices[deviceId].isOn}`);
  };

  // Mở modal cài đặt
  const handleOpenSettings = (deviceId) => {
    setEditingDevice(deviceId);
    setIsModalOpen(true);
  };

  // Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDevice(null);
  };

  // Lưu cài đặt từ modal
  const handleSaveSettings = (deviceType, newSettings) => {
    if (editingDevice) {
      setDevices(prev => ({
        ...prev,
        [editingDevice]: { ...prev[editingDevice], settings: newSettings }
      }));
       // TODO: Gửi API cập nhật settings
      console.log(`Saved settings for ${editingDevice}:`, newSettings);
    }
  };

  // Xử lý bật/tắt lịch trình
  const handleScheduleToggle = (scheduleId) => {
       setSchedules(prev => prev.map(sch =>
           sch.id === scheduleId ? { ...sch, isActive: !sch.isActive } : sch
       ));
       // TODO: Gửi API cập nhật trạng thái lịch trình
       const toggledSchedule = schedules.find(sch => sch.id === scheduleId);
       console.log(`Toggled schedule ${scheduleId} to ${!toggledSchedule.isActive}`);
   };

  // Tắt tất cả thiết bị (Manual)
  const handleTurnOffAll = () => {
       setDevices(prev => {
           const nextState = { ...prev };
           Object.keys(nextState).forEach(key => {
               if (key.includes('Manual')) { // Chỉ tắt các thiết bị manual
                   nextState[key] = { ...nextState[key], isOn: false };
               }
           });
           return nextState;
       });
       // TODO: Gửi API tắt tất cả thiết bị
       console.log('Turning off all manual devices');
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /> {/* Truyền state và hàm toggle */}

      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between p-5 border-b bg-white sticky top-0 z-20">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900 focus:outline-none lg:hidden mr-4" aria-label="Open sidebar">
              <FiMenu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">SMART TOMATO FARM</h1>
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

        {/* Main Content Grid */}
        <div className="p-6 flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Cột 1: Thủ công */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Thủ công</h2>
              <div className="space-y-4">
                <DeviceCard
                  id="light1"
                  deviceName={devices.light1.name}
                  statusText={devices.light1.statusText}
                  isManual={true}
                  isDeviceOn={devices.light1.isOn}
                  onToggleChange={() => handleManualToggle('light1')}
                  // imageUrl="/path/to/light-icon.png" // Thêm URL hình ảnh nếu có
                />
                <DeviceCard
                  id="pump1"
                  deviceName={devices.pump1.name}
                  statusText={devices.pump1.statusText}
                  isManual={true}
                  isDeviceOn={devices.pump1.isOn}
                  onToggleChange={() => handleManualToggle('pump1')}
                   // imageUrl="/path/to/pump-icon.png" // Thêm URL hình ảnh nếu có
                />
              </div>
            </section>

            {/* Cột 2: Tự động thông minh */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Tự động thông minh</h2>
              <div className="space-y-4">
                 <DeviceCard
                  id="light2"
                  deviceName={devices.light2.name}
                  statusText={devices.light2.statusText}
                  isManual={false} // Hiện nút gear
                  onSettingsClick={() => handleOpenSettings('light2')}
                   // imageUrl="/path/to/light-icon.png"
                />
                <DeviceCard
                  id="pump2"
                  deviceName={devices.pump2.name}
                  statusText={devices.pump2.statusText}
                  isManual={false} // Hiện nút gear
                  onSettingsClick={() => handleOpenSettings('pump2')}
                   // imageUrl="/path/to/pump-icon.png"
                />
              </div>
            </section>

            {/* Cột 3: Hẹn giờ */}
            <section>
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-700">Hẹn giờ ({schedules.filter(s => s.isActive).length})</h2>
                  <button className="text-blue-600 hover:text-blue-800" aria-label="Thêm lịch trình">
                      <FiPlus size={24} />
                  </button>
               </div>
               <div className="bg-gray-200 p-4 rounded-lg shadow-inner space-y-3">
                    {schedules.map(schedule => (
                        <ScheduleEntry
                            key={schedule.id}
                            id={schedule.id}
                            deviceName={schedule.deviceName}
                            icon={schedule.icon}
                            startTime={schedule.startTime}
                            endTime={schedule.endTime}
                            isActive={schedule.isActive}
                            onToggle={() => handleScheduleToggle(schedule.id)}
                        />
                    ))}
                    {schedules.length === 0 && (
                        <p className='text-center text-gray-500 text-sm'>Chưa có lịch trình nào.</p>
                    )}
               </div>
            </section>
          </div>

          {/* Nút Turn Off All */}
          <div className="mt-auto pt-6 text-center">
             <button
                onClick={handleTurnOffAll}
                className="w-full max-w-xs bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 px-6 rounded-lg shadow transition duration-200 flex items-center justify-center mx-auto"
             >
                <FiPower size={20} className="mr-2"/>
                Turn Off All Devices
             </button>
          </div>
        </div>

        {/* Modal */}
        <SettingsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          deviceType={editingDevice ? devices[editingDevice]?.type : null}
          deviceName={editingDevice ? devices[editingDevice]?.name : ''}
          currentSettings={editingDevice ? devices[editingDevice]?.settings : {}}
          onSave={handleSaveSettings}
        />
      </main>
    </div>
  );
};

export default Devices;