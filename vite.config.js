import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // relative assets + hash router → деплой в любой путь/домен, deep-link не 404-ит
  base: './',
  server: {
    port: 5173, // 3000/4000/5000/8080/6000 заняты другими проектами
    strictPort: true,
    host: true,
    allowedHosts: [
      'sad-chicken-thank.loca.lt', // ваш текущий домен
      '.loca.lt',                   // или разрешить все поддомены localtunnel
      '.trycloudflare.com',         // cloudflared quick tunnel (без интерстициала)
      '.pinggy.io',                 // pinggy ssh-туннель
      '.pinggy-free.link',          // pinggy free (без токена)
      '.pinggy.net',
    ],
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2019',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },
})
