import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const adminBasePath = process.env.VITE_APP_BASE_PATH || '/';

export default defineConfig({
  base: adminBasePath,
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1400,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3002,
  },
});
