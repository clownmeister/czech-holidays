import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import autoprefixer from 'autoprefixer';

export default defineConfig({
    resolve: {
      alias: {
        '@app': resolve(__dirname, 'src')
      }
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        fileName: 'czech-holidays',
        formats: ['es']
      },
      sourcemap: true,
      minify: true
    },
    plugins: [
      dts({
        insertTypesEntry: true
      })
    ],
    css: {
      postcss: {
        plugins: [autoprefixer({})]
      }
    },
    server: {
      port: 5176,
      open: true
    }
});

