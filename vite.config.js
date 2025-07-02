// vite.config.js
import { resolve } from 'path' 
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      'mindar-image-three': 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js'
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
})