import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/mistral': {
        target: 'https://api.mistral.ai/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mistral/, ''),
        secure: true,
        headers: {
          'Authorization': `Bearer MV9ekEPIb1K6WbOHFUtdDSq7Yb8CcdHj`,
          'Content-Type': 'application/json',
        }
      }
    }
  }
})
