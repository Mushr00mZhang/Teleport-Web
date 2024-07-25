import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  server: {
    port: 3010,
    proxy: {
      '/api/login': {
        target: 'http://10.77.11.10:3011',
        ws: true,
        rewrite: () => 'http://10.77.11.10:3011/api/login',
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
