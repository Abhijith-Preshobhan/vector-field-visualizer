import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base path for universal GitHub Pages hosting & subpath support
  base: '/vector-field-visualizer/',
  server: {
    port: 3000,
    open: true
  }
});
