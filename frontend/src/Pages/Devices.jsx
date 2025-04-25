import React, { useState, useEffect, Fragment, useRef } from 'react';
import SettingsModal from '../Components/SettingModal';
import DeviceCard from '../Components/DeviceCard';
import ScheduleEntry from '../Components/ScheduleEntry';
import { Dialog, Transition } from '@headlessui/react';
import pumpImg from '../image/water_pump.png';
import HelperModal from '../Components/HelperModal'; // thêm import

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
import 'dayjs/locale/vi';
import mqtt from 'mqtt';

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
    const [editingDeviceKey, setEditingDeviceKey] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    const clientRef = useRef(null);

    // 1) Load schedules
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/device-schedules')
            .then(res => res.json())
            .then(json => { if (json.success) setSchedules(json.data); })
            .catch(e => console.error('Schedules fetch error', e));
    }, []);

    // 2) MQTT + fetch last sensor values
    useEffect(() => {
        const client = mqtt.connect('wss://io.adafruit.com:443', {
            username: USERNAME,
            password: AIO_KEY,
            connectTimeout: 4000
        });
        clientRef.current = client;

        // REST: lấy giá trị cuối cùng
        Object.entries(SENSOR_FEEDS).forEach(([key, feed]) => {
            fetch(`https://io.adafruit.com/api/v2/${USERNAME}/feeds/${feed}/data/last`, {
                headers: { 'X-AIO-Key': AIO_KEY }
            })
                .then(res => res.json())
                .then(json => {
                    if (json.value != null) {
                        setDevices(d => ({
                            ...d,
                            [key]: {
                                ...d[key],
                                statusText: `${json.value}${d[key].type === 'light' ? ' Lux' : ' %'}`
                            }
                        }));
                    }
                })
                .catch(() => { });
        });

        // Subscribe MQTT
        client.on('connect', () => {
            Object.values({ ...SENSOR_FEEDS, ...CONTROL_FEEDS }).forEach(feed => {
                const topic = `${USERNAME}/feeds/${feed}`;
                client.subscribe(topic, err => {
                    if (!err) console.log(`Subscribed to ${topic}`);
                });
            });
        });

        client.on('message', (topic, message) => {
            const feed = topic.split('/').pop();
            const key = Object.keys(SENSOR_FEEDS).find(k => SENSOR_FEEDS[k] === feed);
            if (key) {
                setDevices(d => ({
                    ...d,
                    [key]: {
                        ...d[key],
                        statusText: `${message.toString()}${d[key].type === 'light' ? ' Lux' : ' %'}`
                    }
                }));
            }
        });

        return () => client.end();
    }, []);

    // Toggle single device
    const handleToggle = key => {
        const newState = !devices[key].isOn;
        setDevices(d => ({
            ...d,
            [key]: { ...d[key], isOn: newState }
        }));
        clientRef.current.publish(
            `${USERNAME}/feeds/${CONTROL_FEEDS[key]}`,
            newState ? '1' : '0',
            { qos: 0 }
        );
    };


    // Schedule handlers
    const handleAddSchedule = () => {
        setEditingSchedule(null);
        setNewSchedule({ feed_key: CONTROL_FEEDS.light1, start_at: '', end_at: '' });
        setShowScheduleModal(true);
    };
    const handleEditSchedule = sch => {
        setEditingSchedule(sch);
        setNewSchedule({
            feed_key: sch.feed_key,
            start_at: dayjs(sch.start_at).format('YYYY-MM-DDTHH:mm'),
            end_at: dayjs(sch.end_at).format('YYYY-MM-DDTHH:mm')
        });
        setShowScheduleModal(true);
    };
    const handleDeleteSchedule = id => {
        if (!window.confirm('Bạn có chắc muốn xóa?')) return;
        fetch(`http://127.0.0.1:8000/api/device-schedules/${id}`, { method: 'DELETE' })
            .then(() => setSchedules(s => s.filter(x => x.id !== id)))
            .catch(console.error);
    };
    const submitSchedule = async () => {
        const url = editingSchedule
            ? `http://127.0.0.1:8000/api/device-schedules/${editingSchedule.id}`
            : 'http://127.0.0.1:8000/api/device-schedules';
        const method = editingSchedule ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newSchedule)
        });
        const json = await res.json();
        if (json.success) {
            setSchedules(s =>
                editingSchedule ? s.map(x => (x.id === json.data.id ? json.data : x)) : [...s, json.data]
            );
            setShowScheduleModal(false);
        }
    };

    // Turn all
    const allOn = Object.values(devices).every(d => d.isOn);
    const handleTurnAll = () => {
        Object.keys(devices).forEach(key => {
            if (devices[key].isOn === allOn) handleToggle(key);
        });
    };

    return (
        <Fragment>
            {/* HEADER */}
            <header className="flex items-center justify-between p-5 border-b bg-white sticky top-0 z-20">
                <h1 className="text-2xl font-bold text-gray-800">SMART TOMATO FARM</h1>
                <div className="flex items-center space-x-4">
                    {/* Help button lên đầu */}
                    <button
                        onClick={() => setShowHelp(true)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Xem hướng dẫn"
                    >
                        <FiHelpCircle size={20} />
                    </button>
                    <FiBell size={20} />
                    <PageSettingsIcon size={20} />
                </div>
            </header>

            {/* MAIN */}
            <div className="p-6 flex-grow">
                {/* Thủ công + Help */}
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">Turn devices</h2>

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
                                imageUrl={pumpImg}
                                imageClassName="w-full h-20 object-contain opacity-70"
                            />
                        ))}
                    </div>
                </section>

                {/* Hẹn giờ + Help */}
                <section className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-700">
                            Schedule ({schedules.filter(s => s.enabled).length})
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setEditingSchedulesMode(m => !m)}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <FiEdit2 size={18} />
                            </button>
                            <button
                                onClick={handleAddSchedule}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                <FiPlus size={20} />
                            </button>

                        </div>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg shadow-inner space-y-3 border border-gray-200">
                        {schedules.length > 0 ? schedules.map(sch => (
                            <ScheduleEntry
                                key={sch.id}
                                id={sch.id}
                                deviceName={sch.feed_key === 'led' ? 'Led RGB' : 'Pumper'}
                                icon={sch.feed_key === 'led' ? FiZap : FiDroplet}
                                startTime={dayjs(sch.start_at).format('HH:mm')}
                                endTime={dayjs(sch.end_at).format('HH:mm')}
                                isActive={sch.enabled}
                                onToggle={!editingSchedulesMode ? () => handleToggle(sch.id) : undefined}
                                onDelete={editingSchedulesMode ? () => handleDeleteSchedule(sch.id) : undefined}
                                onEdit={editingSchedulesMode ? () => handleEditSchedule(sch) : undefined}
                            />
                        )) : (
                            <p className="text-center text-gray-500 py-4">There have no schedule yet.</p>
                        )}
                    </div>
                </section>

                {/* Turn On/Off All */}
                <div className="mt-auto pt-6 text-center">
                    <button
                        onClick={handleTurnAll}
                        className={`w-full max-w-xs font-semibold py-3 px-6 rounded-lg shadow flex items-center justify-center mx-auto ${allOn ? 'bg-amber-700 hover:bg-amber-800 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        <FiPower size={20} className="mr-2" /> {allOn ? 'Turn off all devices' : 'Turn on all devices'}
                    </button>
                </div>
            </div>

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                deviceType={editingDeviceKey && devices[editingDeviceKey].type}
                deviceName={editingDeviceKey && devices[editingDeviceKey].name}
                currentSettings={editingDeviceKey && devices[editingDeviceKey].settings}
            />

            {/* Add/Edit Schedule Modal */}
            <Transition appear show={showScheduleModal} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={() => setShowScheduleModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                        leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                                        {editingSchedule ? 'Sửa lịch hẹn' : 'Thêm lịch hẹn'}
                                    </Dialog.Title>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Thiết bị</label>
                                            <select
                                                value={newSchedule.feed_key}
                                                onChange={e => setNewSchedule(ns => ({ ...ns, feed_key: e.target.value }))}
                                                className="mt-1 block w-full rounded-md border-gray-300"
                                            >
                                                <option value="led">Led RGB</option>
                                                <option value="pumper">Pumper</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Bắt đầu</label>
                                            <input
                                                type="datetime-local"
                                                value={newSchedule.start_at}
                                                onChange={e => setNewSchedule(ns => ({ ...ns, start_at: e.target.value }))}
                                                className="mt-1 block w-full rounded-md border-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Kết thúc</label>
                                            <input
                                                type="datetime-local"
                                                value={newSchedule.end_at}
                                                onChange={e => setNewSchedule(ns => ({ ...ns, end_at: e.target.value }))}
                                                className="mt-1 block w-full rounded-md border-gray-300"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end space-x-2">
                                        <button
                                            onClick={() => setShowScheduleModal(false)}
                                            className="rounded-md border bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                                        >
                                            Huỷ
                                        </button>
                                        <button
                                            onClick={submitSchedule}
                                            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                        >
                                            Lưu
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Help Modal */}
            {/* Help Modal */}
            <HelperModal
                isOpen={showHelp}
                onClose={() => setShowHelp(false)}
                title="Hướng dẫn sử dụng"
            >
                <p><strong>Turn devices:</strong> Bấm công tắc để bật/tắt ngay.</p>
                <p><strong>Schedule:</strong> Dùng icon <FiPlus className="inline" /> để thêm, <FiEdit2 className="inline" /> để sửa, <FiTrash2 className="inline" /> để xóa.</p>
                <p>Icon <FiHelpCircle className="inline" /> để xem hướng dẫn.</p>
            </HelperModal>
        </Fragment >
    );
}
