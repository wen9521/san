import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        // 忽略 Capacitor 和 Cordova 插件的打包
        '@capacitor/core',
        '@capacitor/splash-screen',
        '@capacitor/status-bar',
        '@capacitor-community/http' // 【核心修正】: 将 http 插件添加到这里
      ]
    }
  }
})
