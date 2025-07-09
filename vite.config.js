// vite.config.js
import { resolve } from 'path' 
import { defineConfig } from 'vite'

export default defineConfig({
  base: './', //상대 경로로 빌드
  publicDir: 'public',
  resolve: {
    alias: {
      'mindar-image-three': 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-three.prod.js'
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        slope: resolve(__dirname, 'Slope.html'),
        grad: resolve(__dirname, 'Grad.html'),
        imageUpload: resolve(__dirname, 'imageUpload.html'),
        imageList: resolve(__dirname, 'imageList.html'),
      },
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/storage', 'firebase/firestore', 'firebase/analytics']
        }
      }
    },        
  },
})