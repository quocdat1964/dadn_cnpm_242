// src/Components/ConfigForm.jsx
import React, { useState, useEffect } from 'react';

// Hàm helper để lấy đơn vị giá trị dựa trên loại cảm biến
const getValueUnit = (type) => {
    switch (type) {
        case 'temperature':
            return '°C'; // Đơn vị cho nhiệt độ
        case 'humidity':
        case 'soil_moisture':
            return '%'; // Đơn vị cho độ ẩm
        case 'light':
            return 'Lux'; // Đơn vị cho ánh sáng
        default:
            return '';
    }
};

const ConfigForm = ({ configData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ low: '', high: '', timeValue: '', timeUnit: 'Sec' });

    useEffect(() => {
        setFormData({ low: '', high: '', timeValue: '', timeUnit: 'Sec', ...configData });
    }, [configData]);

    const handleChange = (e) => { setFormData(prev => ({ ...prev, [e.target.name]: e.target.value })); };
    const handleSave = (e) => { e.preventDefault(); onSave({ type: configData.type, ...formData }); };

    const valueUnit = getValueUnit(configData.type);
    const sensorTitle = configData.title || configData.type;

    return (
        <form onSubmit={handleSave} className="space-y-5 text-sm">

            <p className="text-sm font-medium text-slate-700">
                Cấu hình ngưỡng cảnh báo cho: <span className="font-semibold text-teal-600">{sensorTitle}</span>
            </p>

            <div>
                <label className="block font-medium text-slate-700 mb-1.5" htmlFor={`low-${configData.type}`}>
                    Ngưỡng cảnh báo thấp
                </label>

                <div className="flex items-stretch overflow-hidden rounded-md border border-slate-300 shadow-sm focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
                    <input
                        type="number" id={`low-${configData.type}`} name="low" value={formData.low} onChange={handleChange}
                        className="block w-full flex-grow border-none px-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-0 sm:text-sm"
                        placeholder="VD: 10"
                    />

                    {valueUnit && (
                        <span className="inline-flex items-center border-l border-slate-200 bg-slate-50 px-3 text-slate-500">
                            {valueUnit}
                        </span>
                    )}
                </div>
            </div>

            <div>
                <label className="block font-medium text-slate-700 mb-1.5" htmlFor={`high-${configData.type}`}>
                    Ngưỡng cảnh báo cao
                </label>
                <div className="flex items-stretch overflow-hidden rounded-md border border-slate-300 shadow-sm focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
                    <input
                        type="number" id={`high-${configData.type}`} name="high" value={formData.high} onChange={handleChange}
                        className="block w-full flex-grow border-none px-3 py-2 placeholder-slate-400 focus:outline-none focus:ring-0 sm:text-sm"
                        placeholder="VD: 80"
                    />
                    {valueUnit && (
                        <span className="inline-flex items-center border-l border-slate-200 bg-slate-50 px-3 text-slate-500">
                            {valueUnit}
                        </span>
                    )}
                </div>
            </div>

            <div>
                <label className="block font-medium text-slate-700 mb-1.5" htmlFor={`timeValue-${configData.type}`}>
                    Thời gian trễ cảnh báo
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="number" id={`timeValue-${configData.type}`} name="timeValue" value={formData.timeValue} onChange={handleChange} min="0"

                        className="block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                        placeholder="VD: 5"
                    />
                    <select
                        name="timeUnit" value={formData.timeUnit} onChange={handleChange}
                        className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                    >
                        <option value="Sec">Giây (Sec)</option>
                        <option value="Min">Phút (Min)</option>
                        <option value="Hr">Giờ (Hr)</option>
                    </select>
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Thời gian tối thiểu giá trị phải nằm ngoài ngưỡng để kích hoạt cảnh báo.</p>
            </div>

            <div className="flex justify-end space-x-3 border-t border-slate-200 pt-4 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1" // Focus teal
                >
                    Huỷ
                </button>
                <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
                >
                    Lưu thay đổi
                </button>
            </div>
        </form>
    );
};

export default ConfigForm;