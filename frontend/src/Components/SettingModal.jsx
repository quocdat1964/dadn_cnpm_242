// src/components/SettingsModal.jsx
import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiDroplet, FiZap } from 'react-icons/fi'; // Ví dụ icon

const SettingsModal = ({ isOpen, onClose, deviceType, deviceName, currentSettings, onSave }) => {
  const [settings, setSettings] = useState(currentSettings);

  // Cập nhật state nội bộ khi prop thay đổi (khi mở modal cho thiết bị khác)
  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings, isOpen]); // Chạy lại khi mở modal hoặc settings ban đầu thay đổi

  const handleSave = () => {
    onSave(deviceType, settings); // Gọi hàm lưu từ component cha
    onClose(); // Đóng modal sau khi lưu
  };

  // --- Render nội dung tùy theo deviceType ---
  const renderLightSettings = () => (
    <div className="space-y-4">
      <label htmlFor="lightColor" className="block text-sm font-medium text-gray-700">
        Màu sắc đèn:
      </label>
      <select
        id="lightColor"
        name="lightColor"
        value={settings?.color || '#ffffff'}
        onChange={(e) => setSettings({ ...settings, color: e.target.value })}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        <option value="#ffffff">Trắng</option>
        <option value="#fffacd">Vàng ấm</option>
        <option value="#add8e6">Xanh nhạt</option>
        <option value="#ffb6c1">Hồng nhạt</option>
      </select>
      <div className="flex items-center space-x-2">
        <span>Màu hiện tại:</span>
        <div className="w-6 h-6 rounded border border-gray-300" style={{ backgroundColor: settings?.color || '#ffffff' }}></div>
      </div>
    </div>
  );

  const renderPumpSettings = () => (
    <div className="space-y-4">
      <label htmlFor="pumpSpeed" className="block text-sm font-medium text-gray-700">
        Tốc độ bơm (0% - 100%): {settings?.speed || 0}%
      </label>
      <input
        type="range"
        id="pumpSpeed"
        name="pumpSpeed"
        min="0"
        max="100"
        step="10"
        value={settings?.speed || 0}
        onChange={(e) => setSettings({ ...settings, speed: parseInt(e.target.value, 10) })}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
      />
    </div>
  );

  // Xác định nội dung cần render
  let modalContent;
  if (deviceType === 'light') {
    modalContent = renderLightSettings();
  } else if (deviceType === 'pump') {
    modalContent = renderPumpSettings();
  } else {
    modalContent = <p>Loại thiết bị không xác định.</p>;
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Lớp phủ */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        {/* Nội dung Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  <span>Cài đặt cho: {deviceName}</span>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Đóng"
                  >
                    <FiX size={20} />
                  </button>
                </Dialog.Title>
                <div className="mt-4 mb-6">
                  {/* Render nội dung cài đặt dựa trên deviceType */}
                  {modalContent}
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={handleSave}
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SettingsModal;