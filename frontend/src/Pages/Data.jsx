// src/pages/Data.jsx
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import SensorChart from '../Components/SensorChart';
import HelperModal from '../Components/HelperModal'; // ← thêm import
import {
    FiSettings as PageSettingsIcon,
    FiBell,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiHelpCircle,
    FiLoader,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import { Menu, Transition } from '@headlessui/react';

dayjs.locale('en');

const USERNAME = process.env.REACT_APP_AIO_USERNAME;
const AIO_KEY = process.env.REACT_APP_AIO_KEY;


const sensorTypes = [
    { id: 'temperature', name: 'Temperature', unit: '°C', color: 'rgb(255, 99, 132)' },
    { id: 'humidity', name: 'Air Humidity', unit: '%', color: 'rgb(54, 162, 235)' },
    { id: 'soil_moisture', name: 'Soil Moisture', unit: '%', color: 'rgb(139, 69, 19)' },
    { id: 'light', name: 'Light', unit: 'Lux', color: 'rgb(255, 205, 86)' }
];

const feedKeyMap = {
    temperature: 'temperature',
    humidity: 'air-humidity',
    soil_moisture: 'soil-moisturer',
    light: 'light'
};

const granularityOptions = [
    { value: 'year', label: 'Yearly' },
    { value: 'month', label: 'Monthly' },
    { value: 'day', label: 'Daily' },
    { value: 'range', label: 'Custom' }
];

// Compute Plant Health Index (PHI)
function computeTomatoPHI({ temperature, airHumidity, soilMoisture, light }) {
    let score = 0;
    if (temperature >= 18 && temperature <= 25) score += 25;
    else if (temperature >= 15 && temperature <= 30) score += 15;
    if (airHumidity >= 60 && airHumidity <= 70) score += 25;
    else if (airHumidity >= 50 && airHumidity <= 80) score += 15;
    if (soilMoisture >= 50 && soilMoisture <= 70) score += 25;
    else if (soilMoisture >= 40 && soilMoisture <= 80) score += 15;
    if (light >= 10000 && light <= 20000) score += 25;
    else if (light >= 5000 && light <= 30000) score += 15;
    return Math.round(score);
}

export default function Data() {
    const now = dayjs();
    const [granularity, setGranularity] = useState('day');
    const [startTime, setStartTime] = useState(now.startOf('day').format('YYYY-MM-DDTHH:mm'));
    const [endTime, setEndTime] = useState(now.endOf('day').format('YYYY-MM-DDTHH:mm'));
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [chartData, setChartData] = useState({});
    const [phiData, setPhiData] = useState({ labels: [], values: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);


    // Shift the displayed period backward/forward
    const shiftPeriod = dir => {
        let s = dayjs(startTime), e = dayjs(endTime);
        if (granularity === 'year') { s = s.add(dir, 'year'); e = e.add(dir, 'year'); }
        if (granularity === 'month') { s = s.add(dir, 'month'); e = e.add(dir, 'month'); }
        if (granularity === 'day') { s = s.add(dir, 'day'); e = e.add(dir, 'day'); }
        setStartTime(s.format('YYYY-MM-DDTHH:mm'));
        setEndTime(e.format('YYYY-MM-DDTHH:mm'));
    };

    // Fetch sensor charts and compute PHI
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const s = dayjs(startTime), e = dayjs(endTime);
        if (!s.isValid() || !e.isValid()) {
            setError('Invalid start or end time');
            setLoading(false);
            return;
        }
        const startISO = s.toISOString();
        const endISO = e.toISOString();

        try {
            const results = await Promise.all(sensorTypes.map(async sensor => {
                const feedKey = feedKeyMap[sensor.id];
                const url = new URL(`https://io.adafruit.com/api/v2/${USERNAME}/feeds/${feedKey}/data/chart`);
                url.searchParams.set('start_time', startISO);
                url.searchParams.set('end_time', endISO);
                url.searchParams.set('field', 'avg');

                const res = await fetch(url, {
                    headers: {
                        'X-AIO-Key': AIO_KEY,
                        'Content-Type': 'application/json'
                    }
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();

                const labels = json.data.map(r => dayjs(r[0]).format('DD/MM/YYYY HH:mm'));
                const values = json.data.map(r => parseFloat(r[1]));
                return { id: sensor.id, labels, values };
            }));

            // Pivot results
            const byId = results.reduce((acc, { id, labels, values }) => {
                acc[id] = { labels, values };
                return acc;
            }, {});
            setChartData(byId);

            // Compute PHI
            if (results.length) {
                const ts = results[0].labels;
                const phis = ts.map((_, i) => {
                    const t = byId.temperature.values[i] || 0;
                    const h = byId.humidity.values[i] || 0;
                    const sm = byId.soil_moisture.values[i] || 0;
                    const l = byId.light.values[i] || 0;
                    return computeTomatoPHI({ temperature: t, airHumidity: h, soilMoisture: sm, light: l });
                });
                setPhiData({ labels: ts, values: phis });
            }

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [startTime, endTime]);

    // Reset start/end when granularity changes (except 'range')
    useEffect(() => {
        const n = dayjs();
        let s, e;
        if (granularity === 'year') { s = n.startOf('year'); e = n.endOf('year'); }
        if (granularity === 'month') { s = n.startOf('month'); e = n.endOf('month'); }
        if (granularity === 'day') { s = n.startOf('day'); e = n.endOf('day'); }
        if (granularity !== 'range') {
            setStartTime(s.format('YYYY-MM-DDTHH:mm'));
            setEndTime(e.format('YYYY-MM-DDTHH:mm'));
        }
    }, [granularity]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <Fragment>
            <div className="h-screen flex flex-col">
                {/* HEADER */}
                <header className="bg-white border-b flex-shrink-0">
                    <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-semibold">SENSOR DATA HISTORY</h1>

                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsHelpOpen(true)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Help"
                            >
                                <FiHelpCircle size={20} />
                            </button>
                            <PageSettingsIcon className="text-gray-600 hover:text-gray-900" size={20} />
                            <FiBell className="text-gray-600 hover:text-gray-900" size={20} />
                        </div>
                    </div>
                </header>

                {/* MAIN with scroll */}
                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="max-w-6xl mx-auto px-5 py-6">
                        {/* Control Bar */}
                        <div className="bg-white border p-4 rounded mb-6 flex flex-wrap items-center justify-between gap-4">
                            <Menu as="div" className="relative">
                                <Menu.Button className="inline-flex items-center px-4 py-2 border rounded hover:bg-gray-100">
                                    {granularityOptions.find(o => o.value === granularity).label}
                                    <FiChevronDown className="ml-2 h-5 w-5" />
                                </Menu.Button>
                                <Transition as={Fragment}>
                                    <Menu.Items className="absolute mt-2 w-40 bg-white shadow rounded">
                                        {granularityOptions.map(opt => (
                                            <Menu.Item key={opt.value}>
                                                {({ active }) => (
                                                    <button
                                                        onClick={() => setGranularity(opt.value)}
                                                        className={`block w-full px-4 py-2 text-left ${active ? 'bg-gray-100' : ''}`}
                                                    >{opt.label}</button>
                                                )}
                                            </Menu.Item>
                                        ))}
                                    </Menu.Items>
                                </Transition>
                            </Menu>

                            {granularity === 'range' && (
                                <div className="flex gap-4 items-end">
                                    <div>
                                        <label className="text-sm text-gray-600 block">From</label>
                                        <input
                                            type="datetime-local"
                                            value={startTime}
                                            onChange={e => setStartTime(e.target.value)}
                                            className="border rounded p-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600 block">To</label>
                                        <input
                                            type="datetime-local"
                                            value={endTime}
                                            onChange={e => setEndTime(e.target.value)}
                                            className="border rounded p-1"
                                        />
                                    </div>
                                    {/* <button
                                        onClick={fetchData}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
                                    >Apply</button> */}
                                </div>
                            )}

                            <div className="ml-auto flex items-center gap-2">
                                <button
                                    onClick={() => shiftPeriod(-1)}
                                    className="p-2 bg-white border rounded hover:bg-gray-100"
                                    title="Previous"
                                ><FiChevronLeft /></button>
                                <button
                                    onClick={() => shiftPeriod(1)}
                                    className="p-2 bg-white border rounded hover:bg-gray-100"
                                    title="Next"
                                ><FiChevronRight /></button>
                            </div>
                        </div>

                        {/* Sensor Charts */}
                        {loading ? (
                            <div className="flex justify-center items-center py-20">
                                <FiLoader className="animate-spin text-indigo-600 mr-3" size={24} />
                                <span>Loading data...</span>
                            </div>
                        ) : error ? (
                            <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {sensorTypes.map(sensor => (
                                        <SensorChart
                                            key={sensor.id}
                                            title={sensor.name}
                                            chartData={chartData[sensor.id] || { labels: [], values: [] }}
                                            yAxisLabel={sensor.unit}
                                            lineColor={sensor.color}
                                        />
                                    ))}
                                </div>

                                {/* PHI Chart */}
                                {phiData.labels.length > 0 && (
                                    <div className="relative bg-white border rounded p-4 shadow mb-8">
                                        <div className="absolute top-2 right-2 bg-white bg-opacity-75 px-2 py-1 text-xs font-semibold rounded">
                                            PHI
                                        </div>
                                        <h2 className="text-lg font-semibold mb-3">Plant Health Index</h2>
                                        <SensorChart
                                            title=""
                                            chartData={phiData}
                                            yAxisLabel="PHI (0–100)"
                                            lineColor="rgba(34,197,94,0.8)"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>
            <HelperModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="Usage Help">
                <p>• Chọn khoảng thời gian để xem lịch sử dữ liệu cảm biến (daily/monthly/...)</p>
                <p>• Sử dụng nút ← → để chuyển nhanh giữa các khoảng trước/sau.</p>
                <p>• Biểu đồ PHI sẽ hiển thị chỉ số Plant Health Index tính toán từ dữ liệu.</p>
            </HelperModal>
        </Fragment>
    );
}
