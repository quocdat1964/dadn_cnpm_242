/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'beige-light': '#F5F5DC', // Ví dụ màu nền chính
        'sidebar-green': '#38a169', // Ví dụ màu xanh sidebar (có thể dùng màu có sẵn của Tailwind)
        // Thêm các màu thẻ nếu cần
        'card-orange': '#FED7A6', // bg-orange-200
        'card-blue': '#A3BFFA',   // bg-blue-200
        'card-tan': '#D8C4A3',    // Màu tan tùy chỉnh
        'card-yellow': '#FEEBC8', // bg-yellow-200
      },
      minHeight: { // Thêm minHeight nếu cần cho card
        '[280px]': '280px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'), // <--- Thêm dòng này
    // ... các plugin khác nếu có
  ],
}


