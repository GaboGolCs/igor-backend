import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // Todos los archivos comparten la misma BD y Redis de prueba
    fileParallelism: false,
    setupFiles: ['tests/setup/env.ts'],
    globalSetup: 'tests/setup/global.ts',
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
