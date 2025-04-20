import React, { useState, useEffect } from 'react';
import Modal from '../Components/Modal';
import ConfigForm from '../Components/ConfigForm';
import {
  FiSettings,
  FiBell,
  FiThermometer,
  FiDroplet,
  FiCloudDrizzle,
  FiSun,
  FiEdit2,
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertCircle,
  FiMenu,
} from 'react-icons/fi';

const InfoCard = ({ title, value, unit, icon: Icon, bgColor, status, warning, graphColor, cardType, onConfigure }) => {

  const graphStyle = {
    background: `linear-gradient(to top, rgba(255,255,255,0.1), ${graphColor || 'rgba(255,255,255,0.5)'})`,
    height: '50px',
    maskImage: 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDUwIFEgNzUgMCwgMTUwIDMwIFQgMzAwIDIwIFYgNTBaIiBmaWxsPSJibGFjayIvPjwvc3ZnPg==)', // SVG mask tạo hình sóng
    maskSize: '100% 100%',
    WebkitMaskImage: 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wIDUwIFEgNzUgMCwgMTUwIDMwIFQgMzAwIDIwIFYgNTBaIiBmaWxsPSJibGFjayIvPjwvc3ZnPg==)', // Cho Safari/Chrome
    WebkitMaskSize: '100% 100%',
  };


  return (
    <div className={`rounded-lg shadow-md p-5 ${bgColor} text-gray-800 flex flex-col justify-between min-h-[280px]`}>
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg">{title}</h3>
          <Icon size={28} className="text-gray-700 opacity-80" />
        </div>
        <div className="text-4xl font-bold mb-1">
          {value}
          {unit && <span className="text-3xl align-top ml-1">{unit}</span>}
        </div>
        <div className="w-full mt-2 mb-4 opacity-70" style={graphStyle}></div>
      </div>
      <div className="text-sm mt-auto">
        <p><span className="font-semibold">Tình trạng:</span> {status || 'Đang cập nhật...'}</p>
        <p><span className="font-semibold">Cảnh báo:</span> {warning || 'Không có'}</p>
        <button
          onClick={() => onConfigure(cardType, title)}
          className="text-xs text-gray-600 hover:text-gray-900 mt-2 flex items-center ml-auto"
        >
          <FiEdit2 size={12} className="mr-1" /> Tuỳ chỉnh
        </button>
      </div>
    </div>
  );
};


const HomePage = () => {
  const [farmData, setFarmData] = useState({ temperature: null, humidity: null, soil_moisture: null, light: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingConfig, setEditingConfig] = useState(null);

  const [configurations, setConfigurations] = useState({
    temperature: { low: '15', high: '35', timeValue: '5', timeUnit: 'Min' },
    humidity: { low: '40', high: '70', timeValue: '10', timeUnit: 'Min' },
    soil_moisture: { low: '30', high: '60', timeValue: '30', timeUnit: 'Min' },
    light: { low: '1000', high: '50000', timeValue: '1', timeUnit: 'Hr' }
  });

  useEffect(() => {

    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = {
          temperature: 30, humidity: 50, soil_moisture: 50, light: 40000,
          status: { temperature: "Ổn định", humidity: "Bình thường", soil_moisture: "Hơi khô", light: "Đủ sáng" },
          warnings: { soil_moisture: "Cần tưới thêm nước" }
        };
        setFarmData(data);
      } catch (err) { setError(err.message); console.error("Lỗi fetch data:", err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const handleOpenModal = (cardType, cardTitle) => {
    console.log("Mở modal cho:", cardType);
    const currentConfig = configurations[cardType] || {}; 
    setEditingConfig({
      type: cardType, 
      title: cardTitle, 
      ...currentConfig 
    });
    setIsModalOpen(true); // Mở modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConfig(null); 
  };

  const handleSaveConfig = (newConfig) => {
    console.log('Lưu cấu hình từ HomePage:', newConfig);

    setConfigurations(prev => ({
      ...prev,
      [newConfig.type]: {
        low: newConfig.low,
        high: newConfig.high,
        timeValue: newConfig.timeValue,
        timeUnit: newConfig.timeUnit
      }
    }));

    console.log("Cấu hình đã cập nhật:", configurations);

    handleCloseModal();
  };

  return (
    <>
      {/* Header */}
      <header className="flex items-center justify-between pb-5 border-b mb-6 bg-white">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Hello Danny, here is your farm today:</h1>
          <p className="text-sm text-gray-500">{currentDate}</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-gray-500 hover:text-gray-700"><FiSettings size={20} /></button>
          <button className="text-gray-500 hover:text-gray-700 relative"><FiBell size={20} /></button>
        </div>
      </header>

      {/* Khu vực nội dung */}
      <div className="flex-grow flex flex-col">
        {loading && <p className="text-center text-gray-500 py-10">Đang tải dữ liệu...</p>}
        {error && <p className="text-center text-red-500 py-10">Lỗi tải dữ liệu: {error}</p>}

        {!loading && !error && (
          <>
            {/* Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Truyền cardType và onConfigure cho mỗi thẻ */}
              <InfoCard
                title="Nhiệt độ" value={farmData.temperature} unit="°C" icon={FiThermometer} bgColor="bg-orange-100"
                status={farmData.status?.temperature} warning={farmData.warnings?.temperature} graphColor="#FED7AA"
                cardType="temperature" onConfigure={handleOpenModal}
              />
              <InfoCard
                title="Độ ẩm môi trường" value={farmData.humidity} unit="%" icon={FiDroplet} bgColor="bg-blue-100"
                status={farmData.status?.humidity} warning={farmData.warnings?.humidity} graphColor="#BEE3F8"
                cardType="humidity" onConfigure={handleOpenModal}
              />
              <InfoCard
                title="Độ ẩm đất" value={farmData.soil_moisture} unit="%" icon={FiCloudDrizzle} bgColor="bg-yellow-700 bg-opacity-30"
                status={farmData.status?.soil_moisture} warning={farmData.warnings?.soil_moisture} graphColor="#FBD38D"
                cardType="soil_moisture" onConfigure={handleOpenModal}
              />
              <InfoCard
                title="Ánh sáng" value={farmData.light} unit="Lux" icon={FiSun} bgColor="bg-yellow-100"
                status={farmData.status?.light} warning={farmData.warnings?.light} graphColor="#FEFCBF"
                cardType="light" onConfigure={handleOpenModal}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-6 mt-auto pb-6">
              <button className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110"> <FiCheckCircle size={24} /> </button>
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110"> <FiAlertTriangle size={24} /> </button>
              <button className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110"> <FiAlertCircle size={24} /> </button>
            </div>
          </>
        )}
      </div>

      {/* --- Render Modal --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Tuỳ chỉnh ngưỡng cảnh báo - ${editingConfig?.title || ''}`}
      >

        {editingConfig && (
          <ConfigForm
            configData={editingConfig} 
            onSave={handleSaveConfig} 
            onCancel={handleCloseModal} 
          />
        )}
      </Modal>
    </>
  );
};

export default HomePage;