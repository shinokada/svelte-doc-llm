import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    clearMocks: true,
    testTimeout: 10000,
    include: ['tests/**/*.{test,spec}.{js,ts}'],  // Only include tests/ directory
    exclude: [
      'node_modules/**',
      'dist/**',
      'src/tests/**',  // Exclude Svelte component tests
      'src/**/*.{test,spec}.{js,ts}',  // Exclude any tests in src/
      '*.config.js'
    ],
    // Example: run e2e serially when tagged
    sequence: { concurrent: false },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'src/tests/**',
        '*.config.js'
      ]
    }
  }
});