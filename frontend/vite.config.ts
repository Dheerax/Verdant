import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Vite 8 broke allowedHosts: true — must be an explicit array.
    // Wildcards work via leading dot: ".lhr.life" matches all *.lhr.life subdomains.
    allowedHosts: ['.lhr.life', '.localhost.run', '.serveo.net', '.ngrok-free.app', '.ngrok-free.dev', '.trycloudflare.com'],
    proxy: {
      // ML inference backend (FastAPI). Run it on :8000.
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
