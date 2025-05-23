#!/usr/bin/env node

import { loadConfig } from './lib/config.js';
import { cleanDirectory, cleanDirectoryCompletely } from './lib/fileSystem.js';
import { processFiles } from './lib/converter.js';
import path from 'path';
import { glob } from 'glob';

/**
 * Convert Svelte markdown documentation to LLM-friendly format
 */
async function main() {
  console.log('Converting Svelte markdown files to LLM-friendly format...');
  
  // Load configuration
  const config = await loadConfig();
  
  // Log the configuration being used
  console.log('Using configuration:', JSON.stringify(config, null, 2));
  
  const { srcDir, outDir, format, cleanOutDir } = config;
  
  // Create output directory if it doesn't exist
  const outputDirectory = path.resolve(process.cwd(), outDir);
  
  // Clean output directory based on config option
  try {
    if (cleanOutDir) {
      console.log(`Completely cleaning output directory: ${outputDirectory}...`);
      await cleanDirectoryCompletely(outputDirectory);
      console.log('Complete cleanup finished.');
    } else {
      console.log(`Cleaning only files with .${format} extension from ${outputDirectory}...`);
      await cleanDirectory(outputDirectory, format);
      console.log('Selective cleanup complete.');
    }
  } catch (error) {
    console.error(`Error cleaning output directory ${outputDirectory}:`, error.message);
    process.exit(1);
  }
  
  // Find all markdown files in source directory
  const sourceDirectory = path.resolve(process.cwd(), srcDir);
  const mdPattern = path.join(sourceDirectory, '**/*.md');
  
  try {
    const files = await glob(mdPattern);
    
    console.log(`Found ${files.length} markdown files to process`);
    
    // Process all files
    await processFiles(files, config);
    
    console.log('Conversion complete!');
    
  } catch (error) {
    console.error('Error processing markdown files:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});