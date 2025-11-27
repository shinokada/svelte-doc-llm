#!/usr/bin/env node

/**
 * Test that help output works correctly
 * Run with: node test-help.js
 */

import { showHelp } from './lib/cli.js';

console.log('Testing help output...\n');
console.log('='.repeat(80));
showHelp();
console.log('='.repeat(80));
console.log('\n✅ Help output displayed successfully!');
