import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    //  加入 PWA 設定
      VitePWA({
      registerType: 'autoUpdate', // 自動更新 Service Worker
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], // 要快取的靜態資源
      
      // 3. 設定 Manifest (這是 App 的身分證)
      manifest: {
        name: 'Hi refrigerator!', // 安裝後的 App 全名
        short_name: 'HiFridge',   // 手機桌面上顯示的短名
        description: 'Find recipes with ingredients you have!',
        theme_color: '#ffffff',   // 頂部狀態列顏色 (可配合你的深色模式變數調整)
        background_color: '#ffffff', // 啟動畫面背景色
        display: 'standalone',    // 關鍵！這讓它看起來像 App (沒有網址列)
        
        // 4. 指定 Icon 路徑 (對應到 public 資料夾)
        icons: [
          {
            src: 'pwa-192x192.png', // 請確保 public 資料夾有這張圖
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // 請確保 public 資料夾有這張圖
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // 適應圓形或方形圖示
          }
        ]
      }
    })
  ],
})
