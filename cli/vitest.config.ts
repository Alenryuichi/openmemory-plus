import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    // Increase timeout for CLI tests that spawn child processes
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      // Coverage thresholds - 80% target for core modules
      thresholds: {
        // Global thresholds (relaxed for commands that need external deps)
        lines: 15,
        functions: 25,
        branches: 15,
        statements: 15,
        // Per-file thresholds for core modules
        'src/lib/memory/*.ts': {
          lines: 80,
          functions: 80,
          branches: 60,
          statements: 80,
        },
      },
    },
  },
});

