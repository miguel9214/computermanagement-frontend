import { defineConfig } from 'vite'
import vue            from '@vitejs/plugin-vue'
import path           from 'path'

export default defineConfig({
  // 👇 ESTA LÍNEA ES OBLIGATORIA PARA PRODUCCIÓN EN SUBDIRECTORIO
  // Debe coincidir con el nombre de la carpeta que crees en C:\laragon\www\
  base: '/computermanager/', 

  plugins: [ vue() ],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: {
    host: '0.0.0.0',
    port: 5273,
    strictPort: true,
    // Nota: El proxy solo funciona en modo desarrollo (npm run dev).
    // En producción (npm run build), usará tu variable VITE_API_URL.
    proxy: {
      '/api': {
        target: 'http://labhematologia-backend.test',
        changeOrigin: true,
        timeout: 300000, 
      },
    },
  }
})