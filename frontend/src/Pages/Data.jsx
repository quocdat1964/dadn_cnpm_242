// src/pages/Data.jsx
import React, { useState, useEffect, useCallback } from 'react';
import SensorChart from '../Components/SensorChart';
import {
    FiSettings as PageSettingsIcon,
    FiBell,
    FiCalendar,
    FiChevronDown,
    FiLoader
} from 'react-icons/fi';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

dayjs.locale('vi');
const sensorTypes = [
    { id: 'temperature', name: 'Nhiệt độ', unit: '°C', color: 'rgb(255, 99, 132)' },
    { id: 'humidity', name: 'Độ ẩm MT', unit: '%', color: 'rgb(54, 162, 235)' },
    { id: 'soil_moisture', name: 'Độ ẩm đất', unit: '%', color: 'rgb(139, 69, 19)' }, // Brown
    { id: 'light', name: 'Ánh sáng', unit: 'Lux', color: 'rgb(255, 205, 86)' } // Yellow
];

const dateOptions = {
    today: { label: 'Hôm nay', value: 'today' },
    yesterday: { label: 'Hôm qua', value: 'yesterday' },
    dayBeforeYesterday: { label: '2 hôm trước', value: 'dayBeforeYesterday' }
};

const Data = () => {
    const [selectedPeriod, setSelectedPeriod] = useState(dateOptions.today.value);
    const [chartData, setChartData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (period) => {
        setLoading(true);
        setError(null);
        setChartData({}); // Xóa dữ liệu cũ khi fetch mới

        let targetDate;
        const today = dayjs();
        if (period === 'today') {
            targetDate = today;
        } else if (period === 'yesterday') {
            targetDate = today.subtract(1, 'day');
        } else if (period === 'dayBeforeYesterday') {
            targetDate = today.subtract(2, 'day');
        } else {
            targetDate = today; // Mặc định là hôm nay
        }

        const dateString = targetDate.format('YYYY-MM-DD');
        console.log(`Workspaceing data for: ${dateString} (period: ${period})`);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const generateMockData = (baseValue, fluctuation) => {
                const values = [];
                const labels = [];
                for (let i = 0; i < 12; i++) { // 12 điểm dữ liệu
                    const hour = i * 2; // Cách nhau 2 giờ
                    labels.push(`${hour.toString().padStart(2, '0')}:00`);
                    // Tạo giá trị dao động quanh baseValue, cộng thêm yếu tố ngẫu nhiên theo ngày
                    let value = baseValue + (Math.random() - 0.5) * fluctuation;
                    if (period === 'yesterday') value *= 0.95; // Giả sử hôm qua mát hơn
                    if (period === 'dayBeforeYesterday') value *= 1.05; // Giả sử 2 hôm trước nóng hơn
                    values.push(Math.max(0, Math.round(value * 10) / 10)); // Làm tròn và đảm bảo không âm
                }
                return { labels, values };
            };

            const mockApiResponse = {
                temperature: generateMockData(28, 5),      // Nhiệt độ ~28 độ, dao động 5
                humidity: generateMockData(65, 15),       // Độ ẩm ~65%, dao động 15
                soil_moisture: generateMockData(50, 20), // Độ ẩm đất ~50%, dao động 20
                light: generateMockData(600, 400),      // Ánh sáng ~600 Lux, dao động 400
            };
            setChartData(mockApiResponse);

        } catch (err) {
            console.error("Failed to fetch sensor data:", err);
            setError(`Không thể tải dữ liệu${err instanceof Error ? `: ${err.message}` : ''}`);
            setChartData({}); // Đảm bảo không hiển thị biểu đồ cũ khi lỗi
        } finally {
            setLoading(false);
        }
    }, []); // useCallback không có dependencies vì các hàm bên trong không thay đổi

    // useEffect để gọi fetchData khi selectedPeriod thay đổi
    useEffect(() => {
        fetchData(selectedPeriod);
    }, [selectedPeriod, fetchData]);

    const handleDateChange = (newPeriod) => {
        setSelectedPeriod(newPeriod);
    };

    return (
        <Fragment>
            {/* Header */}
            <header className="flex items-center justify-between p-5 border-b bg-white sticky top-0 z-20">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-gray-800">LỊCH SỬ CÁC THÔNG SỐ</h1>
                </div>
                <div className="flex items-center space-x-4">
                    {/* Date Selector Dropdown */}
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
                                {dateOptions[selectedPeriod].label}
                                <FiChevronDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
                            </Menu.Button>
                        </div>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="py-1">
                                    {Object.values(dateOptions).map((option) => (
                                        <Menu.Item key={option.value}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => handleDateChange(option.value)}
                                                    className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                                                        } ${selectedPeriod === option.value ? 'font-bold' : ''
                                                        } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                                                >
                                                    {option.label}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>

                    <button className="text-gray-500 hover:text-gray-700">
                        <PageSettingsIcon size={20} />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700 relative">
                        <FiBell size={20} />
                    </button>
                </div>
            </header>

            {/* Chart Grid Area */}
            <div className="p-6 flex-grow">
                {loading && (
                    <div className="flex justify-center items-center h-full">
                        <FiLoader className="animate-spin text-blue-500 mr-3" size={24} />
                        <p className="text-gray-600">Đang tải dữ liệu...</p>
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-600 bg-red-100 p-4 rounded border border-red-300">
                        <p><strong>Lỗi:</strong> {error}</p>
                    </div>
                )}
                {!loading && !error && Object.keys(chartData).length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sensorTypes.map(sensor => (
                            <SensorChart
                                key={sensor.id}
                                title={sensor.name}
                                chartData={chartData[sensor.id] || { labels: [], values: [] }} // Truyền dữ liệu tương ứng
                                yAxisLabel={sensor.unit}
                                lineColor={sensor.color}
                            />
                        ))}
                    </div>
                )}
                {!loading && !error && Object.keys(chartData).length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <FiCalendar size={40} className="mx-auto mb-2" />
                        <p>Không có dữ liệu cho ngày đã chọn.</p>
                    </div>
                )}
            </div>
        </Fragment>
    );
};

export default Data;