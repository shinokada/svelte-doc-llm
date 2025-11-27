#!/usr/bin/env node

/**
 * Quick smoke test for CLI functionality
 * Run with: node smoke-test.js
 */

import { parseArgs, validateOptions } from './lib/cli.js';
import { filterFilesByOptions } from './lib/fileFilter.js';

console.log('🧪 Running smoke tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

// Test 1: parseArgs with no arguments
test('parseArgs handles no arguments', () => {
  const originalArgv = process.argv;
  process.argv = ['node', 'svelte-doc-llm'];
  const options = parseArgs();
  process.argv = originalArgv;
  
  if (options.directories.length !== 0) {
    throw new Error('Expected empty directories');
  }
  if (options.files.length !== 0) {
    throw new Error('Expected empty files');
  }
  if (options.skipClean !== false) {
    throw new Error('Expected skipClean to be false');
  }
});

// Test 2: parseArgs with -d flag
test('parseArgs handles -d flag', () => {
  const originalArgv = process.argv;
  process.argv = ['node', 'svelte-doc-llm', '-d', 'components', 'forms'];
  const options = parseArgs();
  process.argv = originalArgv;
  
  if (options.directories.length !== 2) {
    throw new Error('Expected 2 directories');
  }
  if (options.directories[0] !== 'components') {
    throw new Error('Expected components');
  }
  if (options.directories[1] !== 'forms') {
    throw new Error('Expected forms');
  }
});

// Test 3: parseArgs with -f flag
test('parseArgs handles -f flag', () => {
  const originalArgv = process.argv;
  process.argv = ['node', 'svelte-doc-llm', '-f', 'test.md'];
  const options = parseArgs();
  process.argv = originalArgv;
  
  if (options.files.length !== 1) {
    throw new Error('Expected 1 file');
  }
  if (options.files[0] !== 'test.md') {
    throw new Error('Expected test.md');
  }
});

// Test 4: parseArgs with --skip-clean
test('parseArgs handles --skip-clean flag', () => {
  const originalArgv = process.argv;
  process.argv = ['node', 'svelte-doc-llm', '--skip-clean'];
  const options = parseArgs();
  process.argv = originalArgv;
  
  if (options.skipClean !== true) {
    throw new Error('Expected skipClean to be true');
  }
});

// Test 5: validateOptions with valid paths
test('validateOptions accepts valid paths', () => {
  const options = {
    directories: ['components', 'forms/inputs'],
    files: ['test.md', 'docs/guide.md']
  };
  
  if (!validateOptions(options)) {
    throw new Error('Expected validation to pass');
  }
});

// Test 6: validateOptions with invalid characters
test('validateOptions rejects invalid characters', () => {
  const options = {
    directories: ['components<test>'],
    files: []
  };
  
  if (validateOptions(options)) {
    throw new Error('Expected validation to fail');
  }
});

// Test 7: filterFilesByOptions with no filters
test('filterFilesByOptions returns all files when no filters', () => {
  const files = ['/src/docs/a.md', '/src/docs/b.md'];
  const options = { directories: [], files: [] };
  const srcDir = '/src/docs';
  
  const filtered = filterFilesByOptions(files, options, srcDir);
  if (filtered.length !== 2) {
    throw new Error('Expected all files to be returned');
  }
});

// Test 8: filterFilesByOptions with directory filter
test('filterFilesByOptions filters by directory', () => {
  const files = [
    '/src/docs/components/alert.md',
    '/src/docs/components/button.md',
    '/src/docs/forms/input.md'
  ];
  const options = { directories: ['components'], files: [] };
  const srcDir = '/src/docs';
  
  const filtered = filterFilesByOptions(files, options, srcDir);
  if (filtered.length !== 2) {
    throw new Error(`Expected 2 files, got ${filtered.length}`);
  }
});

// Test 9: Combined directory and file filter
test('filterFilesByOptions handles combined filters', () => {
  const files = [
    '/src/docs/components/alert.md',
    '/src/docs/components/button.md',
    '/src/docs/forms/input.md',
    '/src/docs/typography/text.md'
  ];
  const options = { 
    directories: ['components'], 
    files: ['typography/text.md'] 
  };
  const srcDir = '/src/docs';
  
  const filtered = filterFilesByOptions(files, options, srcDir);
  if (filtered.length !== 3) {
    throw new Error(`Expected 3 files, got ${filtered.length}`);
  }
});

// Summary
console.log(`\n${'='.repeat(40)}`);
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log(`${'='.repeat(40)}`);

if (failed > 0) {
  console.log('\n❌ Some tests failed!');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}
