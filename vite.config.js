import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages base URL for https://Abhijith-Preshobhan.github.io/vector-field-visualizer/
  base: '/vector-field-visualizer/',
  server: {
    port: 3000,
    open: true
  }
});
