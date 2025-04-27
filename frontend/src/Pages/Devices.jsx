import React, { useState, useEffect, Fragment, useRef } from 'react';
import SettingsModal from '../Components/SettingModal';
import DeviceCard from '../Components/DeviceCard';
import ScheduleEntry from '../Components/ScheduleEntry';
import { Dialog, Transition } from '@headlessui/react';
import { FiLoader } from 'react-icons/fi';
import pumpImg from '../image/water_pump.jpg';
import ledRgb from '../image/led_rgb.jpg'
import HelperModal from '../Components/HelperModal';

import {
    FiSettings as PageSettingsIcon,
    FiBell,
    FiPlus,
    FiPower,
    FiZap,
    FiDroplet,
    FiEdit2,
    FiHelpCircle,
    FiTrash2
} from 'react-icons/fi';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import 'dayjs/locale/vi';
import mqtt from 'mqtt';

dayjs.extend(isBetween);
dayjs.locale('vi');

const USERNAME = process.env.REACT_APP_AIO_USERNAME;
const AIO_KEY = process.env.REACT_APP_AIO_KEY;

const SENSOR_FEEDS = { light1: 'light', pump1: 'soil-moisturer' };
const CONTROL_FEEDS = { light1: 'led', pump1: 'pumper' };

export default function Devices() {
    const [devices, setDevices] = useState({
        light1: { id: 'light1', name: 'Led RGB', type: 'light', statusText: '-- Lux', isOn: false },
        pump1: { id: 'pump1', name: 'Pumper', type: 'pumper', statusText: '-- %', isOn: false }
    });
    const [schedules, setSchedules] = useState([]);
    const [editingSchedulesMode, setEditingSchedulesMode] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [newSchedule, setNewSchedule] = useState({
        feed_key: CONTROL_FEEDS.light1,
        start_at: '',
        end_at: ''
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editingDeviceKey, setEditingDeviceKey] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    const clientRef = useRef(null);
    const devicesRef = useRef(devices);
    useEffect(() => {
        devicesRef.current = devices;
    }, [devices]);

    useEffect(() => {
        setLoading(true);
        fetch('http://127.0.0.1:8000/api/device-schedules')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(json => {
                if (json.success && Array.isArray(json.data)) {
                    setSchedules(json.data);
                } else {
                    console.error('API response format error or fetch unsuccessful:', json);
                    setSchedules([]);
                }
            })
            .catch(e => {
                console.error('Schedules fetch error:', e);
                setSchedules([]);
            })
            .finally(() => {
            });
    }, []);
    const submitSchedule = async () => {
        const isEditing = !!editingSchedule;
        const url = isEditing
            ? `http://127.0.0.1:8000/api/device-schedules/${editingSchedule.id}`
            : 'http://127.0.0.1:8000/api/device-schedules';
        const method = isEditing ? 'PUT' : 'POST';

        if (!newSchedule.feed_key || !newSchedule.start_at || !newSchedule.end_at) {
            alert('Vui lòng điền đầy đủ thông tin lịch hẹn.');
            return;
        }
        const formattedSchedule = {
            ...newSchedule,
            start_at: dayjs(newSchedule.start_at).format('YYYY-MM-DD HH:mm:ss'),
            end_at: dayjs(newSchedule.end_at).format('YYYY-MM-DD HH:mm:ss')
        };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedSchedule)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Lỗi ${response.status}`;
                throw new Error(`Failed to ${isEditing ? 'update' : 'add'} schedule. ${errorMessage}`);
            }

            const json = await response.json();

            if (json.success && json.data) {
                setSchedules(currentSchedules =>
                    isEditing
                        ? currentSchedules.map(sch => (sch.id === json.data.id ? json.data : sch))
                        : [...currentSchedules, json.data]
                );
                setShowScheduleModal(false);
            } else {
                throw new Error(json.message || `API did not return success for ${isEditing ? 'update' : 'add'}.`);
            }
        } catch (error) {
            console.error('Error submitting schedule:', error);
            alert(`Đã xảy ra lỗi khi ${isEditing ? 'cập nhật' : 'thêm'} lịch hẹn: ${error.message}`);
        } finally {
        }
    };
    const handleToggleSchedule = async (scheduleId) => {
        const scheduleIndex = schedules.findIndex(s => s.id === scheduleId);
        if (scheduleIndex === -1) {
            console.error(`Schedule with id ${scheduleId} not found in state.`);
            return;
        }

        const originalSchedule = schedules[scheduleIndex];
        const targetState = !originalSchedule.enabled;

        setSchedules(currentSchedules =>
            currentSchedules.map(sch =>
                sch.id === scheduleId ? { ...sch, enabled: targetState } : sch
            )
        );
        console.log(`Optimistic UI update for schedule ${scheduleId}: set to ${targetState}`);

        const url = `http://127.0.0.1:8000/api/device-schedules/${scheduleId}/toggle`;
        try {
            const response = await fetch(url, { method: 'PATCH' });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Lỗi ${response.status}`;
                console.error(`API call failed: ${url}, Status: ${response.status}. Rolling back UI.`);
                setSchedules(currentSchedules =>
                    currentSchedules.map(sch =>
                        sch.id === scheduleId ? originalSchedule : sch
                    )
                );
                alert(`Lỗi: Không thể ${targetState ? 'bật' : 'tắt'} lịch hẹn (ID: ${scheduleId}). ${errorMessage}. Trạng thái đã được khôi phục.`);
                return;
            }

            console.log(`Successfully called API ${url} for schedule ${scheduleId}. Optimistic update confirmed.`);

        } catch (error) {

            console.error(`Network or other error calling API ${url} for schedule ${scheduleId}:`, error);

            setSchedules(currentSchedules =>
                currentSchedules.map(sch =>
                    sch.id === scheduleId ? originalSchedule : sch
                )
            );
            alert(`Lỗi mạng khi ${targetState ? 'bật' : 'tắt'} lịch hẹn (ID: ${scheduleId}): ${error.message}. Trạng thái đã được khôi phục.`);
        }
    };

    const handleAddSchedule = () => {
        setEditingSchedule(null);
        setNewSchedule({
            feed_key: CONTROL_FEEDS.light1,
            start_at: '',
            end_at: ''
        });
        setShowScheduleModal(true);
    };

    const handleEditSchedule = (scheduleToEdit) => {
        setEditingSchedule(scheduleToEdit);
        setNewSchedule({
            feed_key: scheduleToEdit.feed_key,
            start_at: dayjs(scheduleToEdit.start_at).format('YYYY-MM-DDTHH:mm'),
            end_at: dayjs(scheduleToEdit.end_at).format('YYYY-MM-DDTHH:mm')
        });
        setShowScheduleModal(true);
    };

    const handleDeleteSchedule = (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa lịch hẹn này?')) return;

        const originalSchedules = [...schedules];
        setSchedules(s => s.filter(x => x.id !== id));

        fetch(`http://127.0.0.1:8000/api/device-schedules/${id}`, { method: 'DELETE' })
            .then(async response => {
                if (!response.ok) {
                    const errorData = await response.json().catch(() => null);
                    const errorMessage = errorData?.message || `Lỗi ${response.status}`;
                    throw new Error(`Failed to delete schedule. ${errorMessage}`);
                }
                console.log(`Schedule ${id} deleted successfully.`);
            })
            .catch(error => {
                console.error('Error deleting schedule:', error);

                setSchedules(originalSchedules);
                alert(`Lỗi khi xóa lịch hẹn: ${error.message}`);
            });
    };

    useEffect(() => {
        console.log("SCHEDULE CHECKER: Setting up interval.");

        const checkAndExecuteSchedules = () => {
            const now = dayjs();
            const currentDevices = devicesRef.current;

            schedules.forEach(schedule => {
                if (!schedule.enabled) {
                    return;
                }

                const startTime = dayjs(schedule.start_at);
                const endTime = dayjs(schedule.end_at);
                const feedKey = schedule.feed_key;

                const deviceKey = Object.keys(CONTROL_FEEDS).find(
                    key => CONTROL_FEEDS[key] === feedKey
                );

                if (!deviceKey || !currentDevices[deviceKey]) {
                    return;
                }

                const shouldBeOn = now.isBetween(startTime, endTime, null, '[)');
                const currentState = currentDevices[deviceKey].isOn;

                if (shouldBeOn !== currentState) {
                    console.log(`SCHEDULE TRIGGER: Schedule ${schedule.id} requires ${deviceKey} (${feedKey}) to be ${shouldBeOn ? 'ON' : 'OFF'}. Current state is ${currentState ? 'ON' : 'OFF'}. Triggering API call.`);
                    triggerDeviceActionAPI(feedKey, shouldBeOn, deviceKey);
                }
            });
        };

        checkAndExecuteSchedules();
        const intervalId = setInterval(checkAndExecuteSchedules, 10000);

        return () => {
            console.log("SCHEDULE CHECKER: Clearing interval.");
            clearInterval(intervalId);
        };
    }, [schedules]);

    const triggerDeviceActionAPI = async (feedKey, turnOn, deviceKey) => {
        const apiValue = turnOn ? '1' : '0';
        const url = 'http://127.0.0.1:8000/api/devices/control';
        const body = JSON.stringify({ feed_key: feedKey, value: apiValue });
        const deviceName = devicesRef.current[deviceKey]?.name || feedKey;

        console.log(`SCHEDULE API CALL: Sending ${apiValue} to ${feedKey} (${deviceName}) via ${url}`);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Lỗi ${response.status}`;
                console.error(`SCHEDULE API FAIL: Failed to ${turnOn ? 'turn ON' : 'turn OFF'} ${deviceName} (${feedKey}). Error: ${errorMessage}`);
            } else {
                console.log(`SCHEDULE API OK: Command ${apiValue} sent successfully for ${deviceName} (${feedKey}). Waiting for MQTT confirmation.`);
            }
        } catch (error) {
            console.error(`SCHEDULE NETWORK ERROR: Failed to send command for ${deviceName} (${feedKey}):`, error);
        }
    };

    useEffect(() => {
        const client = mqtt.connect('wss://io.adafruit.com:443', {
            username: USERNAME,
            password: AIO_KEY,
            connectTimeout: 4000
        });
        clientRef.current = client;

        const fetchLastValuesPromises = Object.entries(SENSOR_FEEDS).map(([key, feed]) =>
            fetch(`https://io.adafruit.com/api/v2/${USERNAME}/feeds/${feed}/data/last`, {
                headers: { 'X-AIO-Key': AIO_KEY }
            })
            .then(res => res.ok ? res.json() : Promise.reject(`Failed to fetch last value for ${feed}`))
            .then(json => {
                if (json.value != null) {
                    setDevices(d => ({
                        ...d,
                        [key]: {
                            ...d[key],
                            statusText: `${json.value}${d[key]?.type === 'light' ? ' Lux' : ' %'}`
                        }
                    }));
                }
            })
            .catch(e => console.warn(`Error fetching last value for ${feed}:`, e))
        );

        Promise.allSettled(fetchLastValuesPromises).finally(() => {
            setLoading(false);
            console.log("Initial data loading complete (Schedules + Last Sensor Values).");
        });

        client.on('connect', () => {
            console.log('MQTT Connected!');
            Object.values({ ...SENSOR_FEEDS, ...CONTROL_FEEDS }).forEach(feed => {
                const topic = `${USERNAME}/feeds/${feed}`;
                client.subscribe(topic, err => {
                    if (!err) console.log(`Subscribed to ${topic}`);
                    else console.error(`MQTT Subscribe error for ${topic}:`, err);
                });
            });
        });

        client.on('message', (topic, message) => {
            const feed = topic.split('/').pop();
            const messageStr = message.toString();
             console.log(`MQTT Message received on ${topic}: ${messageStr}`);

            const sensorKey = Object.keys(SENSOR_FEEDS).find(k => SENSOR_FEEDS[k] === feed);
            if (sensorKey) {
                setDevices(d => {
                    if (!d[sensorKey]) return d;
                    return {
                        ...d,
                        [sensorKey]: {
                            ...d[sensorKey],
                            statusText: `${messageStr}${d[sensorKey].type === 'light' ? ' Lux' : ' %'}`
                        }
                    };
                });
            }
            const controlKey = Object.keys(CONTROL_FEEDS).find(k => CONTROL_FEEDS[k] === feed);
            if (controlKey) {
                const isOn = messageStr === '1';
                setDevices(d => {
                    if (!d[controlKey]) return d;
                    if (d[controlKey].isOn !== isOn) {
                        console.log(`Updating device ${controlKey} state via MQTT to ${isOn}`);
                         return {
                              ...d,
                              [controlKey]: { ...d[controlKey], isOn: isOn }
                         };
                    }
                     return d;
                });
            }
        });

        client.on('error', (err) => { console.error('MQTT Connection Error:', err); });
        client.on('close', () => { console.log('MQTT Connection Closed.'); });
        client.on('offline', () => { console.log('MQTT Client Offline.'); });
        client.on('reconnect', () => { console.log('MQTT Client Reconnecting...'); });

        return () => {
            if (clientRef.current) {
                console.log("Ending MQTT connection.");
                clientRef.current.end(true);
                clientRef.current = null;
            }
        };
    }, []);

    const handleToggle = async (key) => {
        const deviceToToggle = devices[key];
        if (!deviceToToggle) {
            console.error(`Device with key "${key}" not found.`);
            return;
        }

        const originalState = deviceToToggle.isOn;
        const targetState = !originalState;
        const apiValue = targetState ? '1' : '0';
        const feedKey = CONTROL_FEEDS[key];

        if (!feedKey) {
            console.error(`Control feed key not defined for device key: ${key}`);
            alert(`Lỗi cấu hình: Không tìm thấy feed key cho ${deviceToToggle.name}.`);
            return;
        }

        setDevices(currentDevices => ({
            ...currentDevices,
            [key]: { ...currentDevices[key], isOn: targetState }
        }));
        console.log(`Optimistic UI update for ${key}: set to ${targetState}`);

        const url = 'http://127.0.0.1:8000/api/devices/control';
        const body = JSON.stringify({ feed_key: feedKey, value: apiValue });

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Lỗi ${response.status}`;
                console.error(`API call failed: ${url} for ${key}, Status: ${response.status}. Rolling back UI.`);
                setDevices(currentDevices => ({
                    ...currentDevices,
                    [key]: { ...currentDevices[key], isOn: originalState }
                }));
                alert(`Lỗi: Không thể ${targetState ? 'bật' : 'tắt'} ${deviceToToggle.name}. ${errorMessage}. Trạng thái đã được khôi phục.`);
                return;
            }
            console.log(`Successfully called API ${url} for ${key}. Waiting MQTT confirmation.`);

        } catch (error) {
            console.error(`Network or other error calling API ${url} for ${key}:`, error);
            setDevices(currentDevices => ({
                ...currentDevices,
                [key]: { ...currentDevices[key], isOn: originalState }
            }));
            alert(`Lỗi mạng khi ${targetState ? 'bật' : 'tắt'} ${deviceToToggle.name}: ${error.message}. Trạng thái đã được khôi phục.`);
        }
    };

    const allOn = Object.values(devices).every(d => d.isOn);
    const handleTurnAll = async () => {
        const originalDevices = JSON.parse(JSON.stringify(devices));
        const targetState = !allOn;

        setDevices(currentDevices => {
            const updatedDevices = { ...currentDevices };
            Object.keys(updatedDevices).forEach(key => {
                updatedDevices[key] = { ...updatedDevices[key], isOn: targetState };
            });
            console.log("Optimistic UI Update for ALL devices set to:", targetState ? "ON" : "OFF");
            return updatedDevices;
        });

        const url = targetState
            ? 'http://127.0.0.1:8000/api/devices/turn-on-all'
            : 'http://127.0.0.1:8000/api/devices/turn-off-all';

        try {
            const response = await fetch(url, { method: 'POST' });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.message || `Lỗi ${response.status}`;
                console.error(`API call failed: ${url}, Status: ${response.status}. Rolling back UI.`);
                setDevices(originalDevices);
                alert(`Lỗi: Không thể ${targetState ? 'bật' : 'tắt'} tất cả thiết bị. ${errorMessage}. Trạng thái giao diện đã được khôi phục.`);
                return;
            }
            console.log(`Successfully called API ${url}. Waiting MQTT confirmation for each device.`);

        } catch (error) {
            console.error(`Network or other error calling API ${url}:`, error);
            setDevices(originalDevices);
            alert(`Lỗi mạng hoặc lỗi khác khi ${targetState ? 'bật' : 'tắt'} tất cả thiết bị: ${error.message}. Trạng thái giao diện đã được khôi phục.`);
        }
    };

    if (loading) {
        return (
            <div className="flex w-full h-full items-center justify-center bg-gray-100">
                <FiLoader className="animate-spin text-blue-500 mr-3" size={40} />
                <span>Đang tải dữ liệu ban đầu...</span>
            </div>
        );
    }
    return (
        <Fragment>
            <header className="flex items-center justify-between p-5 border-b bg-white static top-0 z-20 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">SMART TOMATO FARM</h1>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowHelp(true)}
                        className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        title="Xem hướng dẫn"
                    >
                        <FiHelpCircle size={20} />
                    </button>
                    <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative" title="Thông báo">
                        <FiBell size={20} />
                    </button>
                    <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100" title="Cài đặt trang">
                        <PageSettingsIcon size={20} />
                    </button>
                </div>
            </header>

            <div className="p-6 flex-grow bg-gray-50">
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">Điều khiển thủ công</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(devices).map(([key, d]) => (
                            <DeviceCard
                                key={key}
                                id={key}
                                deviceName={d.name}
                                statusText={d.statusText}
                                isManual
                                isDeviceOn={d.isOn}
                                onToggleChange={() => handleToggle(key)}
                                imageUrl={d.type === 'pumper' ? pumpImg : ledRgb}
                                Icon={d.type === 'light' ? FiZap : FiDroplet}
                                imageClassName="w-16 h-16 mx-auto mb-2 opacity-70"
                            />
                        ))}
                    </div>
                </section>

                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">
                            Lịch hẹn ({schedules.filter(s => s.enabled).length} đang bật)
                        </h2>
                        <div className="flex space-x-2 items-center">
                            <span className={`mr-2 text-sm font-medium ${editingSchedulesMode ? 'text-red-600' : 'text-gray-500'}`}>
                                {editingSchedulesMode ? 'Chế độ sửa' : ''}
                            </span>
                            <button
                                onClick={() => setEditingSchedulesMode(m => !m)}
                                className={`p-2 rounded-full hover:bg-gray-200 ${editingSchedulesMode ? 'text-red-600 bg-red-100 hover:bg-red-200' : 'text-gray-600 hover:text-gray-800'}`}
                                title={editingSchedulesMode ? "Tắt chế độ sửa" : "Bật chế độ sửa (Xóa/Sửa lịch)"}
                            >
                                <FiEdit2 size={18} />
                            </button>
                            <button
                                onClick={handleAddSchedule}
                                className="p-2 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-100 disabled:opacity-50"
                                title="Thêm lịch hẹn mới"
                                disabled={editingSchedulesMode}
                            >
                                <FiPlus size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md space-y-3 border border-gray-200 min-h-[100px]">
                        {schedules.length > 0 ? schedules.map(sch => (
                            <ScheduleEntry
                                key={sch.id}
                                id={sch.id}
                                deviceName={Object.values(devices).find(d => CONTROL_FEEDS[d.id] === sch.feed_key)?.name || sch.feed_key}
                                icon={sch.feed_key === CONTROL_FEEDS.light1 ? FiZap : FiDroplet}
                                startTime={dayjs(sch.start_at).format('HH:mm')}
                                endTime={dayjs(sch.end_at).format('HH:mm')}
                                isActive={sch.enabled}
                                onToggle={!editingSchedulesMode ? () => handleToggleSchedule(sch.id) : undefined}
                                onDelete={editingSchedulesMode ? () => handleDeleteSchedule(sch.id) : undefined}
                                onEdit={editingSchedulesMode ? () => handleDeleteSchedule(sch.id) : undefined}
                            />
                        )) : (
                            <p className="text-center text-gray-500 py-4">Chưa có lịch hẹn nào được tạo.</p>
                        )}
                    </div>
                </section>

                <div className="mt-auto pt-6 text-center">
                    <button
                        onClick={handleTurnAll}
                        className={`w-full max-w-xs font-semibold py-3 px-6 rounded-lg shadow-md flex items-center justify-center mx-auto transition-colors duration-200 ease-in-out ${
                            allOn
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                        <FiPower size={20} className="mr-2" /> {allOn ? 'Tắt tất cả thiết bị' : 'Bật tất cả thiết bị'}
                    </button>
                </div>
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                deviceType={editingDeviceKey && devices[editingDeviceKey]?.type}
                deviceName={editingDeviceKey && devices[editingDeviceKey]?.name}
                currentSettings={editingDeviceKey && devices[editingDeviceKey]?.settings}
            />

            <Transition appear show={showScheduleModal} as={Fragment}>
                <Dialog as="div" className="relative z-30" onClose={() => setShowScheduleModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                        leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-30" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                        {editingSchedule ? 'Sửa lịch hẹn' : 'Thêm lịch hẹn mới'}
                                    </Dialog.Title>
                                    <form onSubmit={(e) => { e.preventDefault(); submitSchedule(); }}>
                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="schedule-device" className="block text-sm font-medium text-gray-700 mb-1">Thiết bị</label>
                                                <select
                                                    id="schedule-device"
                                                    value={newSchedule.feed_key}
                                                    onChange={e => setNewSchedule(ns => ({ ...ns, feed_key: e.target.value }))}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    required
                                                >
                                                    {Object.entries(CONTROL_FEEDS).map(([deviceKey, feedKey]) => (
                                                        <option key={feedKey} value={feedKey}>
                                                            {devices[deviceKey]?.name || feedKey}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label htmlFor="start_at" className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
                                                <input
                                                    id="start_at"
                                                    type="datetime-local"
                                                    value={newSchedule.start_at}
                                                    onChange={e => setNewSchedule(ns => ({ ...ns, start_at: e.target.value }))}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="end_at" className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
                                                <input
                                                    id="end_at"
                                                    type="datetime-local"
                                                    value={newSchedule.end_at}
                                                    onChange={e => setNewSchedule(ns => ({ ...ns, end_at: e.target.value }))}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                    required
                                                />
                                                {newSchedule.start_at && newSchedule.end_at && dayjs(newSchedule.end_at).isBefore(dayjs(newSchedule.start_at)) && (
                                                    <p className="mt-1 text-xs text-red-600">Thời gian kết thúc phải sau thời gian bắt đầu.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6 flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowScheduleModal(false)}
                                                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                                disabled={newSchedule.start_at && newSchedule.end_at && dayjs(newSchedule.end_at).isBefore(dayjs(newSchedule.start_at))}
                                            >
                                                Lưu
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <HelperModal
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
                title="Hướng dẫn sử dụng"
            >
                <div className="space-y-3 text-sm text-gray-700">
                    <p><strong><FiPower className="inline mr-1" /> Điều khiển thủ công:</strong> Bấm vào công tắc trên thẻ thiết bị để bật/tắt ngay lập tức.</p>
                    <p><strong><FiBell className="inline mr-1" /> Lịch hẹn:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Xem danh sách các lịch hẹn đã tạo. Lịch hẹn có nền sáng hơn đang được bật (<code className='text-xs bg-green-100 px-1 rounded'>active</code>), nền tối hơn là đang tắt (<code className='text-xs bg-gray-100 px-1 rounded'>inactive</code>).</li>
                        <li>Component sẽ tự động kiểm tra các lịch hẹn đang <code className='text-xs bg-green-100 px-1 rounded'>active</code> mỗi phút và gửi lệnh bật/tắt thiết bị tương ứng nếu thời gian hiện tại khớp với lịch trình.</li>
                        <li>Bấm vào một lịch hẹn (khi không ở chế độ sửa) để bật/tắt lịch hẹn đó (sử dụng <code className="text-xs">PATCH /toggle</code> API) - việc này chỉ kích hoạt/hủy kích hoạt lịch hẹn, không trực tiếp bật/tắt thiết bị ngay lập tức.</li>
                        <li>Bấm nút <FiEdit2 className="inline text-gray-600" /> để vào <strong>Chế độ sửa</strong>.</li>
                        <li>Khi ở Chế độ sửa: Bấm <FiEdit2 className="inline text-red-600" /> (cây bút) trên lịch hẹn để <strong>xóa</strong> lịch hẹn đó. Bấm lại nút <FiEdit2 className="inline text-red-600" /> ở góc trên để thoát chế độ sửa.</li>
                        <li>Bấm nút <FiPlus className="inline text-blue-600" /> (khi không ở chế độ sửa) để thêm lịch hẹn mới (sử dụng <code className="text-xs">POST /device-schedules</code> API).</li>
                    </ul>
                    <p><strong><FiPower className="inline mr-1" /> Bật/Tắt tất cả:</strong> Nút ở cuối trang dùng để bật hoặc tắt đồng thời tất cả các thiết bị trong phần điều khiển thủ công.</p>
                    <p><strong><FiHelpCircle className="inline mr-1" /> Trợ giúp:</strong> Bấm vào icon này để xem lại hướng dẫn.</p>
                </div>
            </HelperModal>
        </Fragment >
    );
}