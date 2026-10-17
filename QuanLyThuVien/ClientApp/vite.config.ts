import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Cổng cố định phải khớp Vite:ServerUrl; không tự nhảy cổng vì Razor sẽ tiếp tục nạp URL đã cấu hình.
    port: 5173,
    strictPort: true,
    cors: true,
    origin: 'http://localhost:5173',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
  build: {
    outDir: '../wwwroot/dist',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: {
        // main mount widget qua registry; index mount riêng catalog. Tên entry được Razor tham chiếu trực tiếp.
        main: path.resolve(__dirname, 'src/main.tsx'),
        index: path.resolve(__dirname, 'src/index.tsx'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});
