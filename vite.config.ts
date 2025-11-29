import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports
      protocolImports: true,
      // Whether to polyfill specific globals
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  server: {
    proxy: {
      // Proxy for backend API
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'), // Keep /api prefix
      },
    },
  },
})
