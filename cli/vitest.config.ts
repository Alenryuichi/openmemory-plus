import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts'],
      // Coverage thresholds - 80% target for core modules
      thresholds: {
        // Global thresholds (relaxed for commands that need external deps)
        lines: 20,
        functions: 30,
        branches: 20,
        statements: 20,
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

