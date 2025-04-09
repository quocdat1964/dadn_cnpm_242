// src/components/ScheduleEntry.jsx
import React from 'react';
import { FiClock, FiCalendar, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const ScheduleEntry = ({
  id,
  deviceName,
  icon: Icon, // Component Icon
  startTime,
  endTime,
  isActive,
  onToggle,
  disabled = false,
}) => {
  return (
    <div className={`flex items-center justify-between p-3 bg-white rounded-md shadow-sm mb-3 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <div className="flex items-center space-x-3">
        {Icon && <Icon size={24} className="text-blue-600" />}
        <span className="font-medium text-gray-700">{deviceName}</span>
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center">
          <FiClock size={14} className="mr-1" />
          <span>{startTime}</span>
          <span className="mx-1">-</span>
          <span>{endTime}</span>
        </div>
        <FiCalendar size={16} className="text-gray-500" title="Lịch trình" />
      </div>
      <button onClick={onToggle} disabled={disabled} aria-label={`Bật/tắt lịch trình ${deviceName}`}>
        {isActive ? (
          <FiToggleRight size={24} className="text-green-500 cursor-pointer" />
        ) : (
          <FiToggleLeft size={24} className="text-gray-400 cursor-pointer" />
        )}
      </button>
    </div>
  );
};

export default ScheduleEntry;