import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Electron에서 상대 경로를 사용하도록 설정
  base: './',
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    // Electron 최적화 설정
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // 파일명에 해시 제거 (선택사항)
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
