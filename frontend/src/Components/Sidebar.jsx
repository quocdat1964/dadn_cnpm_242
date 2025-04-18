// // src/components/Sidebar.jsx
// import React, { useState } from 'react';
// import {
//   FiHome,
//   FiCpu,
//   FiDatabase,
//   FiUser,
//   FiLogOut,
//   FiMenu,
//   FiX,
// } from 'react-icons/fi'; // Sử dụng Feather Icons

// const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
//   const [activeItem, setActiveItem] = useState('HOME'); // Quản lý mục đang active

//   const navItems = [
//     { name: 'HOME', icon: FiHome },
//     { name: 'DEVICE', icon: FiCpu },
//     { name: 'DATA', icon: FiDatabase },
//     { name: 'USER', icon: FiUser },
//   ];

//   // Tailwind classes cho sự đồng nhất
//   const linkClasses =
//     'flex items-center w-full px-4 py-3 text-gray-200 hover:bg-green-600 hover:text-white transition-colors duration-200 rounded-md';
//   const activeLinkClasses = 'bg-green-600 text-white font-semibold';

//   return (
//     <>
//       {/* Lớp phủ nền mờ khi sidebar mở trên mobile */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden"
//           onClick={toggleSidebar}
//         ></div>
//       )}

//       {/* Sidebar */}
//       <aside
//         className={`fixed inset-y-0 left-0 z-40 w-64 bg-green-700 text-white transform ${
//           isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
//       >
//         <div className="flex flex-col h-full">
//           {/* User Info */}
//           <div className="flex items-center p-4 border-b border-green-600">
//              {/* Nút đóng cho mobile, chỉ hiển thị trên mobile khi sidebar mở */}
//              <button
//                 onClick={toggleSidebar}
//                 className="text-gray-300 hover:text-white focus:outline-none lg:hidden mr-3"
//                 aria-label="Close sidebar"
//              >
//                 <FiX size={24} />
//              </button>
//             <img
//               src="https://via.placeholder.com/40" // Thay bằng URL ảnh đại diện thực tế
//               alt="User Avatar"
//               className="w-10 h-10 rounded-full mr-3 border-2 border-green-500"
//             />
//             <span className="text-lg font-semibold">Danny</span>
//           </div>

//           {/* Navigation */}
//           <nav className="flex-grow px-4 py-6 space-y-2">
//             {navItems.map((item) => (
//               <button
//                 key={item.name}
//                 onClick={() => setActiveItem(item.name)}
//                 className={`${linkClasses} ${
//                   activeItem === item.name ? activeLinkClasses : ''
//                 }`}
//               >
//                 <item.icon className="w-5 h-5 mr-3" />
//                 <span className="text-sm uppercase tracking-wider">{item.name}</span>
//               </button>
//             ))}
//           </nav>

//           {/* Logout Button */}
//           <div className="px-4 py-4 border-t border-green-600">
//             <button className={`${linkClasses}`}>
//               <FiLogOut className="w-5 h-5 mr-3" />
//               <span className="text-sm uppercase tracking-wider">LOG OUT</span>
//             </button>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;

// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import Link và useLocation
import {
  FiHome,
  FiCpu,
  FiDatabase,
  FiUser,
  FiLogOut,
  FiX,
} from 'react-icons/fi';

// Helper function để xác định path dựa trên tên item
const getPathFromName = (name) => {
  switch (name) {
    case 'HOME': return '/';
    case 'DEVICE': return '/devices';
    case 'DATA': return '/data';
    case 'USER': return '/user';
    default: return '/';
  }
};

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  // Sử dụng useLocation để lấy đường dẫn hiện tại
  const location = useLocation();

  // Xác định activeItem dựa trên location.pathname
  const determineActiveItem = (pathname) => {
    if (pathname === '/devices') return 'DEVICE';
    if (pathname === '/data') return 'DATA';
    if (pathname === '/user') return 'USER';
    if (pathname === '/') return 'HOME';
    return 'HOME'; // Mặc định là HOME
  };

  const activeItem = determineActiveItem(location.pathname);

  const navItems = [
    { name: 'HOME', icon: FiHome, path: '/' },
    { name: 'DEVICE', icon: FiCpu, path: '/devices' },
    { name: 'DATA', icon: FiDatabase, path: '/data' },
    { name: 'USER', icon: FiUser, path: '/user' },
  ];

  const linkClasses =
    'flex items-center w-full px-4 py-3 text-gray-200 hover:bg-green-600 hover:text-white transition-colors duration-200 rounded-md';
  const activeLinkClasses = 'bg-green-600 text-white font-semibold';

  return (
    <>
      {/* Lớp phủ nền mờ khi sidebar mở trên mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-green-700 text-white transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex-shrink-0`} // Thêm flex-shrink-0
      >
        <div className="flex flex-col h-full">
          {/* User Info & Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-green-600">
            <div className="flex items-center">
              <img
                src="https://via.placeholder.com/40" // Thay bằng URL ảnh đại diện thực tế
                alt="User Avatar"
                className="w-10 h-10 rounded-full mr-3 border-2 border-green-500"
              />
              <span className="text-lg font-semibold">Danny</span>
            </div>
            {/* Nút đóng cho mobile */}
            <button
              onClick={toggleSidebar}
              className="text-gray-300 hover:text-white focus:outline-none lg:hidden"
              aria-label="Close sidebar"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-grow px-4 py-6 space-y-2">
            {navItems.map((item) => (
              <Link // Thay thế <button> bằng <Link>
                key={item.name}
                to={item.path} // Sử dụng prop 'to' để chỉ định đường dẫn
                onClick={isSidebarOpen ? toggleSidebar : undefined} // Đóng sidebar khi nhấp vào link trên mobile
                className={`${linkClasses} ${
                  activeItem === item.name ? activeLinkClasses : ''
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="text-sm uppercase tracking-wider">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="px-4 py-4 border-t border-green-600">
            {/* TODO: Thêm chức năng logout */}
            <button className={`${linkClasses}`}>
              <FiLogOut className="w-5 h-5 mr-3" />
              <span className="text-sm uppercase tracking-wider">LOG OUT</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;