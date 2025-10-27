#!/usr/bin/env node

import { loadConfig } from './lib/config.js';
import { cleanDirectory, cleanDirectoryCompletely } from './lib/fileSystem.js';
import { processFiles, generateLlmsTxt, generateContextFull } from './lib/converter.js';
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
    const files = await glob(mdPattern, { nodir: true });

    console.log(`Found ${files.length} markdown files to process`);

    // Process all files
    const processedFiles = await processFiles(files, config);

    console.log('Conversion complete!');

    if (processedFiles.length === 0) {
      console.warn('No files processed. Skipping llms.txt and context-full.txt generation.');
      return;
    }
    // Generate llms.txt file
    console.log('Generating llms.txt...');
    await generateLlmsTxt(processedFiles, config);
    console.log('llms.txt generated successfully!');

    // Generate context-full.txt file
    console.log('Generating context-full.txt...');
    await generateContextFull(processedFiles, config);
    console.log('context-full.txt generated successfully!');

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
