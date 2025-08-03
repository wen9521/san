import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all requests starting with /api to your PHP backend
      '/api': {
        // Your PHP backend is likely running on port 80 or 8000.
        // We target http://localhost and rely on your backend to handle it.
        target: 'http://localhost', 
        changeOrigin: true, // This is crucial for virtual hosted sites
        secure: false,      // Don't verify SSL certs
        
        // This function rewrites the request path from '/api/login.php' to '/login.php'
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
