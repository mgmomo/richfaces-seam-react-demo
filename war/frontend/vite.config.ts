import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/vision4-seam/app/',
  server: {
    proxy: {
      '/vision4-seam/api': {
        target: 'http://localhost:8180',
        changeOrigin: true,
      },
    },
  },
})
