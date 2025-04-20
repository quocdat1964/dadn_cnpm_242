// src/pages/Devices.jsx
import React, { useState, Fragment } from 'react';
import SettingsModal from '../Components/SettingModal';
import DeviceCard from '../Components/DeviceCard';
import ScheduleEntry from '../Components/ScheduleEntry';
import pump from '../image/water_pump.png'
import {
    FiSettings as PageSettingsIcon,
    FiBell,
    FiPlus,
    FiPower,
    FiZap, 
    FiDroplet
} from 'react-icons/fi';

const initialDevicesData = {
    light1: { id: 'light1', name: 'Đèn', type: 'light', statusText: 'Ánh sáng 30 LUX', isOn: false, isManual: true, settings: { threshold: 50 } },
    pump1: { id: 'pump1', name: 'Máy bơm', type: 'pump', statusText: 'Độ ẩm đất 30 %', isOn: false, isManual: true, settings: { duration: 10 } },
    light2: { id: 'light2', name: 'Đèn', type: 'light', statusText: 'Ánh sáng 30 LUX', isManual: false, settings: { threshold: 70 } },
    pump2: { id: 'pump2', name: 'Máy bơm', type: 'pump', statusText: 'Độ ẩm đất 30 %', isManual: false, settings: { threshold: 40 } },
};

const initialSchedulesData = [
    { id: 'sch1', deviceName: 'Đèn', deviceType: 'light', icon: FiZap, startTime: '8 pm', endTime: '8 am', isActive: true },
    { id: 'sch2', deviceName: 'Máy bơm', deviceType: 'pump', icon: FiDroplet, startTime: '8 pm', endTime: '8 am', isActive: true },
];

const Devices = () => {
    const [devices, setDevices] = useState(initialDevicesData);
    const [schedules, setSchedules] = useState(initialSchedulesData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDeviceKey, setEditingDeviceKey] = useState(null); 

    // Bật/tắt thiết bị thủ công
    const handleManualToggle = async (deviceKey) => {
        const deviceToToggle = devices[deviceKey];
        if (!deviceToToggle || !deviceToToggle.isManual) return;

        const newIsOn = !deviceToToggle.isOn;
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
                [deviceKey]: { ...prev[deviceKey], isOn: !newIsOn } 
            }));
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
        setIsModalOpen(false);

        try {
            console.log(`API CALL: Saving settings for ${editingDeviceKey}:`, newSettings);
            // await api.updateDeviceSettings(editingDeviceKey, newSettings); // Gọi API thật
            setEditingDeviceKey(null); // Xóa key đang sửa sau khi thành công
        } catch (error) {
            console.error(`Failed to save settings for ${editingDeviceKey}:`, error);
            // Rollback state nếu API lỗi
            setDevices(prev => ({
                ...prev,
                [editingDeviceKey]: { ...prev[editingDeviceKey], settings: originalSettings }
            }));
            setIsModalOpen(true);
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
        }
    };

    // Thêm lịch trình (Placeholder)
    const handleAddSchedule = () => {
        console.log("API CALL: Request to add a new schedule");
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

    // Lấy thông tin device đang chỉnh sửa cho Modal
    const currentEditingDevice = editingDeviceKey ? devices[editingDeviceKey] : null;

    return (
        <Fragment>
            <header className="flex items-center justify-between p-5 border-b bg-white">
                 <div className="flex items-center">
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
                    <section className="max-w-xs mx-auto w-full">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Thủ công</h2>
                        <div className="space-y-4">
                            <DeviceCard
                                id={devices.light1?.id}
                                deviceName={devices.light1?.name}
                                statusText={devices.light1?.statusText}
                                isManual={true}
                                isDeviceOn={devices.light1?.isOn}
                                onToggleChange={() => handleManualToggle('light1')}
                                imageUrl={pump}
                            />
                            <DeviceCard
                                id={devices.pump1?.id}
                                deviceName={devices.pump1?.name}
                                statusText={devices.pump1?.statusText}
                                isManual={true}
                                isDeviceOn={devices.pump1?.isOn}
                                onToggleChange={() => handleManualToggle('pump1')}
                                imageUrl={pump}
                            />
                        </div>
                    </section>

                    {/* Cột 2: Tự động thông minh */}
                    <section className="max-w-xs mx-auto w-full">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Tự động thông minh</h2>
                        <div className="space-y-4">
                            <DeviceCard
                                id={devices.light2?.id}
                                deviceName={devices.light2?.name}
                                statusText={devices.light2?.statusText}
                                isManual={false} 
                                onSettingsClick={() => handleOpenSettings('light2')}
                                imageUrl={pump}
                            />
                            <DeviceCard
                                id={devices.pump2?.id}
                                deviceName={devices.pump2?.name}
                                statusText={devices.pump2?.statusText}
                                isManual={false}
                                onSettingsClick={() => handleOpenSettings('pump2')}
                                imageUrl={pump}
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
                         <div className="bg-gray-100 p-4 rounded-lg shadow-inner space-y-3 border border-gray-200">
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

                 deviceType={currentEditingDevice?.type}
                 deviceName={currentEditingDevice?.name}
                 currentSettings={currentEditingDevice?.settings || {}}
                 onSave={handleSaveSettings}
            />
        </Fragment>
    );
};

export default Devices;