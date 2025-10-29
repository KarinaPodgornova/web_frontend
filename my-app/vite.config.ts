import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:80", // ваш бэкенд порт
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, "/"),
      },
    }, 
    port: 3000,
    watch: {
      usePolling: true, // для hot-reload в Docker
    },
    host: true, // для правильного маппинга портов в Docker
    strictPort: true, // не даст использовать другой порт если 3000 занят
  },
  plugins: [react()],
})