import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
  host: true,
  port: 5173,
  allowedHosts: true,
  hmr: { clientPort: 443 }
  },
  build: {
    rollupOptions: {
      input: {
        index: `${root}index.html`,
        dashboard: `${root}dashboard.html`
      }
    }
  }
});