// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../Components/Sidebar';
import {
  FiSettings,
  FiBell,
  FiThermometer,
  FiDroplet,
  FiCloudDrizzle, // Hoặc icon khác cho độ ẩm đất
  FiSun,
  FiEdit2,
  FiCheckCircle,
  FiAlertTriangle,
  FiAlertCircle,
  FiMenu, // Icon Hamburger
} from 'react-icons/fi';

// Component Card tái sử dụng
const InfoCard = ({ title, value, unit, icon: Icon, bgColor, status, warning, graphColor }) => {
  // Tạo gradient giả lập biểu đồ
  const graphStyle = {
    background: `linear-gradient(to top, rgba(255,255,255,0.1), ${graphColor || 'rgba(255,255,255,0.5)'})`,
    height: '50px', // Điều chỉnh chiều cao biểu đồ
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
         {/* Placeholder cho biểu đồ */}
         <div className="w-full mt-2 mb-4 opacity-70" style={graphStyle}></div>
      </div>

      <div className="text-sm mt-auto">
        <p><span className="font-semibold">Tình trạng:</span> {status || 'Đang cập nhật...'}</p>
        <p><span className="font-semibold">Cảnh báo:</span> {warning || 'Không có'}</p>
        <button className="text-xs text-gray-600 hover:text-gray-900 mt-2 flex items-center ml-auto">
          <FiEdit2 size={12} className="mr-1" /> Tuỳ chỉnh
        </button>
      </div>
    </div>
  );
};


const HomePage = () => {
  const [farmData, setFarmData] = useState({
    temperature: null,
    humidity: null,
    soil_moisture: null,
    light: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State cho sidebar mobile

  // Giả lập fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Thay thế bằng API call thực tế
        // const response = await fetch('/api/farm-data');
        // if (!response.ok) {
        //   throw new Error('Network response was not ok');
        // }
        // const data = await response.json();

        // Dữ liệu giả lập
        await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập độ trễ mạng
        const data = {
          temperature: 30,
          humidity: 50,
          soil_moisture: 50,
          light: 40,
          status: { // Thêm trạng thái và cảnh báo giả lập
             temperature: "Ổn định",
             humidity: "Bình thường",
             soil_moisture: "Hơi khô",
             light: "Đủ sáng"
          },
          warnings: {
             soil_moisture: "Cần tưới thêm nước"
          }
        };

        setFarmData(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch farm data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Chạy 1 lần khi component mount

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Lấy ngày tháng hiện tại
  const currentDate = new Date().toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex h-screen w-screen bg-beige-light overflow-hidden"> {/* Đảm bảo toàn màn hình */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className="flex-1 flex flex-col overflow-y-auto bg-gray-100"> {/* Cho phép cuộn nội dung chính */}
        {/* Header của nội dung chính */}
        <header className="flex items-center justify-between p-5 border-b bg-white sticky top-0 z-20">
          <div className="flex items-center">
             {/* Hamburger button - chỉ hiển thị trên mobile */}
             <button
                onClick={toggleSidebar}
                className="text-gray-600 hover:text-gray-900 focus:outline-none lg:hidden mr-4"
                aria-label="Open sidebar"
             >
                <FiMenu size={24} />
             </button>
             <div>
               <h1 className="text-xl font-semibold text-gray-800">Hello Danny, here is your farm today:</h1>
               <p className="text-sm text-gray-500">{currentDate}</p>
             </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <FiSettings size={20} />
            </button>
            <button className="text-gray-500 hover:text-gray-700 relative">
              <FiBell size={20} />
              {/* Optional: Add a notification badge */}
              {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span> */}
            </button>
          </div>
        </header>

        {/* Khu vực nội dung chính (Cards & Buttons) */}
        <div className="p-6 flex-grow">
          {loading && <p className="text-center text-gray-500">Đang tải dữ liệu...</p>}
          {error && <p className="text-center text-red-500">Lỗi tải dữ liệu: {error}</p>}

          {!loading && !error && (
            <>
              {/* Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <InfoCard
                  title="Nhiệt độ"
                  value={farmData.temperature}
                  unit="°C"
                  icon={FiThermometer}
                  bgColor="bg-orange-200"
                  status={farmData.status?.temperature}
                  warning={farmData.warnings?.temperature}
                  graphColor="#FEB2B2" // Màu nhạt của Orange/Red
                />
                <InfoCard
                  title="Độ ẩm môi trường"
                  value={farmData.humidity}
                  unit="%"
                  icon={FiDroplet} // Có thể dùng FiCloudDrizzle nếu thích hợp hơn
                  bgColor="bg-blue-200"
                  status={farmData.status?.humidity}
                  warning={farmData.warnings?.humidity}
                  graphColor="#90CDF4" // Màu nhạt của Blue
                />
                 <InfoCard
                  title="Độ ẩm đất"
                  value={farmData.soil_moisture}
                  unit="%"
                  icon={FiCloudDrizzle} // Placeholder icon
                  bgColor="bg-yellow-700 bg-opacity-40" // Tan/Brown
                  status={farmData.status?.soil_moisture}
                  warning={farmData.warnings?.soil_moisture}
                  graphColor="#F6E05E" // Màu nhạt của Yellow/Amber
                />
                <InfoCard
                  title="Ánh sáng"
                  value={farmData.light}
                  unit="%"
                  icon={FiSun}
                  bgColor="bg-yellow-200"
                  status={farmData.status?.light}
                  warning={farmData.warnings?.light}
                  graphColor="#FAF089" // Màu nhạt của Yellow
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-6 mt-auto">
                <button className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110">
                  <FiCheckCircle size={24} />
                </button>
                <button className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110">
                  <FiAlertTriangle size={24} />
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110">
                  <FiAlertCircle size={24} />
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;