import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{js,ts}'],  // Only include tests/ directory
    exclude: [
      'node_modules/**',
      'dist/**',
      'src/tests/**',  // Exclude Svelte component tests
      'src/**/*.{test,spec}.{js,ts}',  // Exclude any tests in src/
      '*.config.js'
    ],
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