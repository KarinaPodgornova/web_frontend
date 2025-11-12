import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
      },
      // УБЕРИ manifest отсюда - используй отдельный файл
      includeAssets: ['logo192.png', 'logo512.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      }
    })
  ],
  base: '/web_frontend',
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:80",
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
    }, 
    host: true,
    strictPort: true,
    port: 3000,
  },
})