import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'easy-order-3rd_dining',
        short_name: 'easy-order',
        description: 'A web app to assist table ordering in restaurants.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '3rd.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '3rd.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})
