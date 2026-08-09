import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA — offline nivel 2: app instalable con el shell completo
    // (JS/CSS/HTML/sonidos) precacheado por el service worker, para
    // entrenar sin señal (tren, parque). Los datos de Supabase NO se
    // cachean aquí: los maneja la capa data/ (cola offline + snapshot
    // local en localStorage).
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-192.png', 'pwa-512.png'],
      manifest: {
        name: 'Sakura System',
        short_name: 'Sakura',
        description:
          'Aprende japonés como un videojuego — hiragana, katakana, gramática y kanji.',
        lang: 'es',
        theme_color: '#04060F',
        background_color: '#04060F',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache: shell + sonidos del juego (mp3 pequeños).
        globPatterns: ['**/*.{js,css,html,svg,png,mp3}'],
        // Las fuentes de Google se cachean en runtime la primera vez
        // que hay red; después funcionan offline.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-css',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
