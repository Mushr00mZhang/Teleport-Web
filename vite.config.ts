import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8890,
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => /^md/.test(tag),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@/': '/src/',
    },
  },
});
