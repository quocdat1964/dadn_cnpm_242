// src/components/DeviceCard.jsx
import React from 'react';
import { FiSettings } from 'react-icons/fi';

// Component Toggle Switch đơn giản (có thể tách ra thành component riêng nếu cần)
const ToggleSwitch = ({ id, isChecked, onChange, disabled = false }) => (
  <label htmlFor={id} className="inline-flex relative items-center cursor-pointer">
    <input
      type="checkbox"
      id={id}
      className="sr-only peer"
      checked={isChecked}
      onChange={onChange}
      disabled={disabled}
    />
    <div className={`w-11 h-6 bg-gray-400 rounded-full peer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500`}></div>
  </label>
);

const DeviceCard = ({
  id,
  deviceName,
  imageUrl, // URL hình ảnh/placeholder
  statusText,
  isManual, // true: hiện toggle, false: hiện gear
  isDeviceOn, // Trạng thái bật/tắt (cho manual toggle)
  onToggleChange, // Hàm xử lý khi toggle thay đổi
  onSettingsClick, // Hàm xử lý khi click gear
  disabled = false, // Vô hiệu hóa card
}) => {
  const cardBgColor = 'bg-gray-700'; // Màu nền card theo ảnh (điều chỉnh nếu cần)
  const textColor = 'text-white';

  return (
    <div className={`rounded-lg shadow-md p-4 ${cardBgColor} ${textColor} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      {/* Phần hình ảnh và status */}
      <div className="relative mb-3 h-24 bg-gray-600 rounded flex items-center justify-center overflow-hidden">
        {/* Placeholder Image - Thay bằng hình ảnh thực tế */}
        {imageUrl ? (
             <img src={imageUrl} alt={deviceName} className="max-h-full max-w-full object-contain" />
        ) : (
            <span className="text-gray-400 text-sm">No Image</span>
        )}
        {statusText && (
          <span className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            {statusText}
          </span>
        )}
      </div>

      {/* Tên thiết bị và Control */}
      <div className="flex justify-between items-center">
        <span className="font-semibold">{deviceName}</span>
        {isManual ? (
          <ToggleSwitch
            id={`toggle-${id}`}
            isChecked={isDeviceOn}
            onChange={onToggleChange}
            disabled={disabled}
          />
        ) : (
          <button
            onClick={onSettingsClick}
            className={`text-gray-300 hover:text-white ${disabled ? 'pointer-events-none' : ''}`}
            disabled={disabled}
            aria-label={`Cài đặt ${deviceName}`}
          >
            <FiSettings size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default DeviceCard;