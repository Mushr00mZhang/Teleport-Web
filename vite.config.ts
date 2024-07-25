import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  server: {
    port: 3010,
    proxy: {
      '/api/login': {
        target: 'http://localhost:8889',
        ws: true,
      },

      // '/api': {
      //   target: 'http://localhost:3011',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, ''),
      // },
    },
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
