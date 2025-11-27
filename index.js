#!/usr/bin/env node

import { loadConfig } from './lib/config.js';
import {
  cleanDirectory,
  cleanDirectoryCompletely,
  cleanSpecificFiles
} from './lib/fileSystem.js';
import { processFiles, generateLlmsTxt, generateContextFull } from './lib/converter.js';
import { parseArgs, showHelp, validateOptions } from './lib/cli.js';
import { filterFilesByOptions, getOutputFilesToClean } from './lib/fileFilter.js';
import path from 'path';
import { glob } from 'glob';

const DEBUG = process.env.DEBUG === 'true';

/**
 * Convert Svelte markdown documentation to LLM-friendly format
 */
async function main() {
  // Parse CLI arguments
  const cliOptions = parseArgs();

  // Show help if requested
  if (cliOptions.help) {
    showHelp();
    process.exit(0);
  }

  // Validate options
  if (!validateOptions(cliOptions)) {
    process.exit(1);
  }

  if (DEBUG) {
    console.log('Converting Svelte markdown files to LLM-friendly format...');
  }

  // Load configuration
  const config = await loadConfig();

  // Log the configuration being used
  if (DEBUG) {
    console.log('Using configuration:', JSON.stringify(config, null, 2));
    console.log('CLI options:', JSON.stringify(cliOptions, null, 2));
  }

  const { srcDir, outDir, format, cleanOutDir, ignoreDirs = [] } = config;

  // Create output directory if it doesn't exist
  const outputDirectory = path.resolve(process.cwd(), outDir);

  // Determine if we're doing selective processing
  const isSelectiveMode = cliOptions.directories.length > 0 || cliOptions.files.length > 0;

  // Clean output directory based on config option and CLI flags
  try {
    if (cliOptions.skipClean) {
      if (DEBUG) {
        console.log('Skipping cleanup phase (--skip-clean flag)');
      }
    } else if (isSelectiveMode) {
      if (DEBUG) {
        console.log('Selective mode: will clean only matching output files...');
      }
      // We'll clean specific files after we know which input files match
    } else {
      // Full processing mode - use original cleanup logic
      if (cleanOutDir) {
        if (DEBUG) {
          console.log(`Completely cleaning output directory: ${outputDirectory}...`);
          if (ignoreDirs.length > 0) {
            console.log(`Preserving directories: ${ignoreDirs.join(', ')}`);
          }
        }
        await cleanDirectoryCompletely(outputDirectory, ignoreDirs);
        if (DEBUG) {
          console.log('Complete cleanup finished.');
        }
      } else {
        if (DEBUG) {
          console.log(`Cleaning only files with .${format} extension from ${outputDirectory}...`);
        }
        await cleanDirectory(outputDirectory, format);
        if (DEBUG) {
          console.log('Selective cleanup complete.');
        }
      }
    }
  } catch (error) {
    console.error(`Error cleaning output directory ${outputDirectory}:`, error.message);
    process.exit(1);
  }

  // Find all markdown files in source directory
  const sourceDirectory = path.resolve(process.cwd(), srcDir);
  const mdPattern = path.join(sourceDirectory, '**/*.md');

  try {
    let allFiles = await glob(mdPattern, { nodir: true });

    if (DEBUG) {
      console.log(`Found ${allFiles.length} total markdown files`);
    }

    // Filter files based on CLI options
    const filesToProcess = filterFilesByOptions(allFiles, cliOptions, srcDir);

    if (DEBUG) {
      console.log(`Processing ${filesToProcess.length} markdown files`);
    }

    // In selective mode, clean only the corresponding output files (unless skip-clean is set)
    if (isSelectiveMode && !cliOptions.skipClean) {
      const outputFilesToClean = getOutputFilesToClean(
        filesToProcess,
        srcDir,
        outDir,
        format,
        config.stripPrefix
      );
      if (DEBUG) {
        console.log(`Cleaning ${outputFilesToClean.length} corresponding output files...`);
      }
      await cleanSpecificFiles(outputFilesToClean);
    }

    // Process files
    const processedFiles = await processFiles(filesToProcess, config);

    if (DEBUG) {
      console.log('Conversion complete!');
    }

    if (processedFiles.length === 0) {
      console.warn('No files processed. Skipping llms.txt and context-full.txt generation.');
      return;
    }

    // In selective mode, inform user about partial generation
    if (isSelectiveMode) {
      console.log(
        `\n✓ Processed ${processedFiles.length} file(s) in selective mode`
      );
      console.log(
        '  Note: llms.txt and context-full.txt will contain only the processed files'
      );
    }

    // Generate llms.txt file
    if (DEBUG) {
      console.log('Generating llms.txt...');
    }
    await generateLlmsTxt(processedFiles, config);
    if (DEBUG) {
      console.log('llms.txt generated successfully!');
    }

    // Generate context-full.txt file
    if (DEBUG) {
      console.log('Generating context-full.txt...');
    }
    await generateContextFull(processedFiles, config);
    if (DEBUG) {
      console.log('context-full.txt generated successfully!');
    }

    // Summary
    if (!DEBUG && processedFiles.length > 0) {
      console.log(`\n✓ Successfully processed ${processedFiles.length} file(s)`);
    }
  } catch (error) {
    console.error('Error processing markdown files:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
