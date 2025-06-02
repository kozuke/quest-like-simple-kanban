import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'X-Frame-Options': 'DENY'
    }
  },
  preview: {
    headers: {
      'X-Frame-Options': 'DENY'
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
