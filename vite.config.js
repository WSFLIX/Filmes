import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: '.', // Raiz do projeto (onde está o index.html movido)
  // publicDir: 'public', // Se houver pasta public
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        filmes: path.resolve(__dirname, 'src/components/filmes.html'),
        series: path.resolve(__dirname, 'src/components/series.html'),
        admin: path.resolve(__dirname, 'src/components/admin.html'),
        loginAdmin: path.resolve(__dirname, 'src/components/login-admin.html'),
        categoria: path.resolve(__dirname, 'src/components/categoria.html'),
        debug: path.resolve(__dirname, 'src/components/debug-categories.html'),
      },
    },
  },
});
