#!/usr/bin/env node

/**
 * Test the simplified file matching logic
 */

import { filterFilesByOptions } from './lib/fileFilter.js';
import path from 'path';

console.log('Testing simplified file matching logic...\n');

const mockSrcDir = '/project/src/routes/docs';
const files = [
  path.join(mockSrcDir, 'components/alert.md'),
  path.join(mockSrcDir, 'components/button.md'),
  path.join(mockSrcDir, 'forms/input.md')
];

let passed = 0;
let failed = 0;

function test(name, options, expectedFiles) {
  try {
    const result = filterFilesByOptions(files, options, mockSrcDir);

    // Use expectedFiles.length for the count
    if (result.length !== expectedFiles.length) {
      throw new Error(`Expected ${expectedFiles.length} files, got ${result.length}`);
    }

    for (const expectedFile of expectedFiles) {
      const fullPath = path.join(mockSrcDir, expectedFile);
      if (!result.includes(fullPath)) {
        throw new Error(`Expected to find ${expectedFile}`);
      }
    }

    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

// Test cases
test('Match file with exact extension', { directories: [], files: ['components/alert.md'] }, [
  'components/alert.md'
]);

test('Match file without extension', { directories: [], files: ['components/alert'] }, [
  'components/alert.md'
]);

test(
  'Match multiple files with extensions',
  { directories: [], files: ['components/alert.md', 'forms/input.md'] },
  ['components/alert.md', 'forms/input.md']
);

test(
  'Match multiple files without extensions',
  { directories: [], files: ['components/alert', 'forms/input'] },
  ['components/alert.md', 'forms/input.md']
);

test(
  'Match mixed (with and without extensions)',
  { directories: [], files: ['components/alert.md', 'forms/input'] },
  ['components/alert.md', 'forms/input.md']
);

test(
  'Match files in directory (Directory filter case)',
  { directories: ['components'], files: [] }, // Filter by directory 'components'
  ['components/alert.md', 'components/button.md']
);

test(
  'No files match (No matches case)',
  { directories: [], files: ['non-existent-file.js', 'another-non-match'] },
  [] // Expect an empty array
);

// Summary
console.log(`\n${'='.repeat(40)}`);
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log(`${'='.repeat(40)}`);

if (failed > 0) {
  console.log('\n❌ File matching logic has issues!');
  process.exit(1);
} else {
  console.log('\n✅ Simplified file matching logic works correctly!');
  process.exit(0);
}
