// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import Devices from './Pages/Devices';
import Data from './Pages/Data';
import UserInfo from './Pages/UserInfo';
import Sidebar from './Components/Sidebar';
import { FiMenu } from 'react-icons/fi'; // Import icon menu

function App() {
  // State để quản lý trạng thái đóng/mở của Sidebar trên mobile
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Hàm để bật/tắt Sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router> {/* Bọc toàn bộ ứng dụng trong BrowserRouter */}
      <div className="flex h-screen bg-gray-100"> {/* Layout chính dùng flex */}
        {/* Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar (ví dụ: chứa nút menu cho mobile) */}
          <header className="bg-white shadow-md lg:hidden"> {/* Chỉ hiển thị trên mobile */}
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <span className="text-xl font-semibold text-gray-700">My App</span>
              <button
                onClick={toggleSidebar}
                className="text-gray-500 focus:outline-none focus:text-gray-700"
                aria-label="Toggle menu"
              >
                <FiMenu size={24} />
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            <Routes> {/* Định nghĩa các routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/data" element={<Data />} />
              <Route path="/user" element={<UserInfo />} />
              {/* Bạn có thể thêm các route khác nếu cần */}
              {/* <Route path="*" element={<NotFoundPage />} /> */} {/* Route cho trang 404 */}
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;