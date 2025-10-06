import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // carga variables según el modo (development / production)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: [
        'h.gpsmonitoreorada.site',
        '192.168.1.93',
        'localhost'
      ]
    },
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL) // opcional, para debug
    }
  }
})
