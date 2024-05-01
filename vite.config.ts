import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        '@app': '/src'
      }
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        fileName: 'czech-holidays',
        formats: ['esm']
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
  };
});

