import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    // Khi dùng base: '/jobshare/', mở app tại http://localhost:5173/jobshare/
    strictPort: false,
  },
  optimizeDeps: {
    include: ['react-datepicker', 'date-fns'],
  },
})
