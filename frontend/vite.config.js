import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 【核心修正】: 将 base 设置为相对路径 './'
  // 这确保了 index.html 中引用的资源路径是 ./assets/index-xxx.js 的形式，
  // 而不是 /assets/index-xxx.js，从而解决了在App内无法找到文件的问题。
  base: './', 
})