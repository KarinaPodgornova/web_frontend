import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    mkcert(),  
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
  //base: './', 
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
    https:{
      key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
    },
  },
})