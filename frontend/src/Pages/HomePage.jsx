// src/pages/HomePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Components/Modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ConfigForm from '../Components/ConfigForm';
import mqtt from 'mqtt';
import HelperModal from '../Components/HelperModal';
import {
  FiSettings,
  FiBell,
  FiThermometer,
  FiDroplet,
  FiCloudDrizzle,
  FiSun,
  FiEdit2,
  FiLoader,
  FiHelpCircle
} from 'react-icons/fi';

const USERNAME = process.env.REACT_APP_AIO_USERNAME;
const AIO_KEY = process.env.REACT_APP_AIO_KEY;

const InfoCard = ({
  title, value, unit, icon: Icon, bgColor,
  warning, advice, graphColor, onConfigure
}) => {
  const graphStyle = {
    background: `linear-gradient(to top, rgba(255,255,255,0.1), ${graphColor})`,
    height: '50px',
    maskImage: 'url(data:image/svg+xml;base64,...)',
    WebkitMaskImage: 'url(data:image/svg+xml;base64,...)',
    maskSize: '100% 100%',
    WebkitMaskSize: '100% 100%',
  };

  return (
    <div className={`rounded-lg shadow-md p-5 ${bgColor} text-gray-800 flex flex-col justify-between min-h-[300px]`}>
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg">{title}</h3>
          <Icon size={28} className="text-gray-700 opacity-80" />
        </div>
        <div className="text-4xl font-bold mb-1">
          {value}{unit && <span className="text-3xl align-top ml-1">{unit}</span>}
        </div>
        <div className="w-full mt-2 mb-4 opacity-70" style={graphStyle}></div>
      </div>
      <div className="text-sm space-y-1">
        <p><span className="font-semibold">Cảnh báo:</span> {warning || 'Không có'}</p>
        <p><span className="font-semibold">Khuyến nghị:</span> {advice || 'Không có khuyến nghị'}</p>
      </div>
      <div className="mt-2 flex justify-end">
        <button
          onClick={onConfigure}
          className="text-xs text-gray-600 hover:text-gray-900 flex items-center"
        >
          <FiEdit2 size={12} className="mr-1" />Tuỳ chỉnh
        </button>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [farmData, setFarmData] = useState({ status: {}, warnings: {}, advice: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);        // state cho Helper modal
  const clientRef = useRef(null);

  const feeds = [
    { key: 'temperature', feed_id: 'temperature' },
    { key: 'air_humidity', feed_id: 'air-humidity' },
    { key: 'soil_moisture', feed_id: 'soil-moisturer' },
    { key: 'light', feed_id: 'light' }
  ];

  // Polling data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const results = await Promise.all(feeds.map(({ key, feed_id }) =>
          fetch('http://127.0.0.1:8000/api/environment/evaluate', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feed_id })
          })
            .then(r => { if (!r.ok) throw new Error(feed_id); return r.json(); })
            .then(json => ({ key, ...json.data }))
        ));
        const newData = { status: {}, warnings: {}, advice: {} };
        results.forEach(({ key, value, status, warning, advice }) => {
          newData[key] = value;
          newData.status[key] = status;
          newData.warnings[key] = warning;
          newData.advice[key] = advice;
        });
        setFarmData(newData);
        setError(null);
      } catch (e) {
        setError(`Không tải được dữ liệu: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // MQTT silent connect
  useEffect(() => {
    const client = mqtt.connect('wss://io.adafruit.com:443', {
      username: USERNAME,
      password: AIO_KEY,
      connectTimeout: 4000
    });
    clientRef.current = client;
    client.on('message', () => { });
    return () => client.end();
  }, []);

  const openConfig = (feed_id) => {
    setEditingConfig({ type: feed_id, low: '', high: '', loading: true });
    setIsConfigOpen(true);
    fetch(`http://127.0.0.1:8000/api/sensors/thresholds?feed_id=${feed_id}`)
      .then(res => res.json())
      .then(json => {
        if (!json.success) throw new Error();
        setEditingConfig({
          type: feed_id,
          low: json.data.warning_min.toString(),
          high: json.data.warning_max.toString(),
          loading: false
        });
      })
      .catch(() => {
        toast.error('Không tải được ngưỡng cảnh báo');
        setIsConfigOpen(false);
      });
  };

  const saveConfig = async ({ type, low, high }) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/sensors/thresholds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feed_id: type, warning_min: parseFloat(low), warning_max: parseFloat(high) })
      });
      const json = await res.json();
      if (!json.success) throw new Error();
      toast.success('Cập nhật ngưỡng thành công');
      setIsConfigOpen(false);
    } catch {
      toast.error('Lưu ngưỡng thất bại');
    }
  };

  const today = new Date().toLocaleDateString('vi-VN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  if (loading) {
    return (
      <div className="flex w-full h-full items-center justify-center bg-gray-100">
        <FiLoader className="animate-spin text-blue-500 mr-3" size={40} />
        <span>Đang tải...</span>
      </div>
    );
  }
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <>
      <ToastContainer position="top-right" />

      {/* Header */}
      <header className="flex items-center justify-between p-5 bg-white border-b sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-bold">Đây là thông tin khu vườn của bạn ngày hôm nay:</h1>
          <p className="text-sm text-gray-500">{today}</p>
        </div>
        <div className="flex space-x-4 items-center">
          {/* Helper button */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="text-gray-600 hover:text-gray-900"
            title="Trợ giúp"
          >
            <FiHelpCircle size={20} />
          </button>
          <button><FiBell size={20} /></button>
          <button><FiSettings size={20} /></button>
        </div>
      </header>

      {/* Cards */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {feeds.map(f => (
          <InfoCard
            key={f.key}
            title={{
              temperature: 'Nhiệt độ',
              air_humidity: 'Độ ẩm môi trường',
              soil_moisture: 'Độ ẩm đất',
              light: 'Ánh sáng'
            }[f.key]}
            value={farmData[f.key]}
            unit={{
              temperature: '°C',
              air_humidity: '%',
              soil_moisture: '%',
              light: '%'
            }[f.key]}
            icon={{
              temperature: FiThermometer,
              air_humidity: FiDroplet,
              soil_moisture: FiCloudDrizzle,
              light: FiSun
            }[f.key]}
            bgColor={{
              temperature: 'bg-orange-200',
              air_humidity: 'bg-blue-200',
              soil_moisture: 'bg-yellow-700 bg-opacity-40',
              light: 'bg-yellow-200'
            }[f.key]}
            graphColor={{
              temperature: '#FEB2B2',
              air_humidity: '#90CDF4',
              soil_moisture: '#F6E05E',
              light: '#FAF089'
            }[f.key]}
            warning={farmData.warnings[f.key]}
            advice={farmData.advice[f.key]}
            onConfigure={() => openConfig(f.feed_id)}
          />
        ))}
      </div>

      {/* Config Modal */}
      <Modal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        title={`Tuỳ chỉnh ngưỡng cảnh báo – ${editingConfig?.type}`}
      >
        {editingConfig && (
          <ConfigForm
            configData={editingConfig}
            onSave={saveConfig}
            onCancel={() => setIsConfigOpen(false)}
          />
        )}
      </Modal>

      <HelperModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="Trợ giúp sử dụng"
      >
        <p>• Trang hiển thị 4 chỉ số môi trường: Nhiệt độ, Độ ẩm môi trường, Độ ẩm đất và Ánh sáng.</p>
        <p>• Dữ liệu tự động cập nhật mỗi 10 giây.</p>
        <p>• Nhấn “Tuỳ chỉnh” dưới mỗi ô để thay đổi ngưỡng cảnh báo.</p>
        <p>• Biểu tượng chuông để xem thông báo, bánh răng để vào cài đặt chung.</p>
      </HelperModal >
    </>
  );
};

export default HomePage;
