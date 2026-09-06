import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    // Lets you write `import x from '@/services/http'` instead of '../../services/http'
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true, // reachable from Docker / other devices on the LAN
    port: 5173,
    // Dev-only proxy: the browser calls /api/... on localhost:5173 and Vite
    // forwards it to the backend. Kills CORS problems during development.
    // Enable it by setting VITE_API_BASE_URL=/api in .env.development
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
        // Uncomment if the backend does NOT prefix its routes with /api:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
