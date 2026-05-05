import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

const adminBasePath = process.env.VITE_APP_BASE_PATH || '/';

function getPackageChunkName(id: string) {
  const packagePath = id.split('node_modules/').pop();
  if (!packagePath) return 'vendor';

  const segments = packagePath.split('/');
  const packageName = segments[0]?.startsWith('@') ? `${segments[0]}/${segments[1]}` : segments[0];

  if (packageName === 'react-quill' || packageName === 'quill') {
    return 'vendor-editor';
  }

  if (['react', 'react-dom', 'scheduler'].includes(packageName)) {
    return 'vendor-react';
  }

  return 'vendor';
}

export default defineConfig({
  base: adminBasePath,
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          return getPackageChunkName(id);
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3002,
  },
});
