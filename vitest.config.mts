import { defineConfig } from 'vitest/config';

// 테스트는 빌드한 dist 와 tokens.css 를 읽는다. npm test 가 먼저 빌드한다.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    testTimeout: 30_000,
  },
});
