import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(__dirname),
  base: '/czech-holidays/',
  resolve: {
    alias: {
      '@app': resolve(__dirname, '../src')
    }
  },
  build: {
    outDir: resolve(__dirname, '../dist-demo'),
    emptyOutDir: true
  }
});
