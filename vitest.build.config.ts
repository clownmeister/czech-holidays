import { mergeConfig } from 'vite';
import commonConfig from './vite.config';

export default mergeConfig(commonConfig, {
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/build/**/*.test.ts']
  }
});
