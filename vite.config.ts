import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
    resolve: {
      alias: {
        '@app': resolve(__dirname, 'src')
      }
    },
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'CzechHolidays',
        fileName: 'czech-holidays',
        formats: ['es', 'cjs', 'umd']
      },
      sourcemap: true,
      minify: true,
      rollupOptions: {
        output: {
          exports: 'named'
        }
      }
    },
    plugins: [
      dts({
        insertTypesEntry: true
      })
    ]
});
