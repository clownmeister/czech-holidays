import { mergeConfig } from 'vite';
import commonConfig from './vite.config';

export default mergeConfig(commonConfig, {
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/test.ts', 'tests/**/*.test.ts']
  }
});
