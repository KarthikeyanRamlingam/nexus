import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': '{}',
    'process.version': '"v18.0.0"',
    'process.browser': 'true',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:3001', ws: true, changeOrigin: true },
    },
  },
  optimizeDeps: {
    include: ['simple-peer', 'socket.io-client', 'events', 'buffer'],
    exclude: [],
  },
  build: {
    commonjsOptions: {
      include: [/simple-peer/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
})
