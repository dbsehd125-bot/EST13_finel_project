import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 브라우저 -> http://localhost:5173/api/...  (동일 출처)
      // Vite가 -> https://kdt-api-function.azurewebsites.net/api/... 로 프록시
      '/api': {
        target: 'https://kdt-api-function.azurewebsites.net',
        changeOrigin: true,
        secure: true,
        ws: true, // (혹시나 웹소켓 필요 시)
      },
    },
  },
});
