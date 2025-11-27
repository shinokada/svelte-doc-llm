import path from 'path';

const DEBUG = process.env.DEBUG === 'true';

/**
 * Filter files based on CLI options (directories and files)
 * @param {Array<string>} allFiles - All markdown files found
 * @param {Object} options - CLI options with directories and files arrays
 * @param {string} srcDir - Source directory from config
 * @returns {Array<string>} Filtered array of file paths
 */
export function filterFilesByOptions(allFiles, options, srcDir) {
  const { directories, files } = options;

  // If no specific targets, return all files
  if (directories.length === 0 && files.length === 0) {
    return allFiles;
  }

  const sourceDirectory = path.resolve(process.cwd(), srcDir);
  const filteredFiles = new Set();

  if (DEBUG) {
    console.log(`Filtering ${allFiles.length} files based on CLI options...`);
    console.log(`Source directory: ${sourceDirectory}`);
  }

  // Process directory filters
  for (const dir of directories) {
    if (DEBUG) {
      console.log(`Processing directory filter: ${dir}`);
    }

    // Normalize the directory path
    const normalizedDir = path.normalize(dir).replace(/\\/g, '/');

    // Find all files that are in this directory or its subdirectories
    for (const file of allFiles) {
      const relativePath = path.relative(sourceDirectory, file).replace(/\\/g, '/');

      // Check if the file is in the specified directory
      if (
        relativePath.startsWith(normalizedDir + '/') ||
        path.dirname(relativePath) === normalizedDir
      ) {
        filteredFiles.add(file);
        if (DEBUG) {
          console.log(`  ✓ Matched: ${relativePath}`);
        }
      }
    }
  }

  // Process file filters
  for (const targetFile of files) {
    if (DEBUG) {
      console.log(`Processing file filter: ${targetFile}`);
    }

    // Normalize the file path
    const normalizedFile = path.normalize(targetFile).replace(/\\/g, '/');

    // Find exact file matches or matches without extension
    for (const file of allFiles) {
      const relativePath = path.relative(sourceDirectory, file).replace(/\\/g, '/');
      const relativePathNoExt = relativePath.replace(/\.[^.]+$/, '');

      // Match with or without extension
      if (
        relativePath === normalizedFile ||
        relativePathNoExt === normalizedFile ||
        relativePathNoExt === normalizedFile.replace(/\.[^.]+$/, '')
      ) {
        filteredFiles.add(file);
        if (DEBUG) {
          console.log(`  ✓ Matched: ${relativePath}`);
        }
      }
    }
  }

  const result = Array.from(filteredFiles);

  if (DEBUG) {
    console.log(`Filtered to ${result.length} files`);
  }

  if (result.length === 0 && (directories.length > 0 || files.length > 0)) {
    console.warn('⚠️  Warning: No files matched the specified directories or files');
    console.warn('   Check that paths are relative to srcDir in your config');
  }

  return result;
}

/**
 * Clean only the output files that correspond to the filtered input files
 * @param {Array<string>} filteredFiles - The input files that will be processed
 * @param {string} srcDir - Source directory from config
 * @param {string} outDir - Output directory from config
 * @param {string} format - Output format from config
 * @param {string} stripPrefix - Prefix to strip from config
 * @returns {Array<string>} Array of output file paths that should be cleaned
 */
export function getOutputFilesToClean(filteredFiles, srcDir, outDir, format, stripPrefix) {
  const outputFiles = [];
  const sourceDirectory = path.resolve(process.cwd(), srcDir);
  const outputDirectory = path.resolve(process.cwd(), outDir);

  for (const file of filteredFiles) {
    const relativePath = path.relative(sourceDirectory, file);

    // Apply stripPrefix logic (same as in converter.js)
    let outputRelativePath = relativePath;
    if (stripPrefix && typeof stripPrefix === 'string' && stripPrefix.trim() !== '') {
      const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const prefixPattern = new RegExp(
        `^${esc(stripPrefix).replace(/[/\\]/g, '[\\/\\\\]')}[\\/\\\\]`
      );
      outputRelativePath = relativePath.replace(prefixPattern, '');

      if (outputRelativePath === relativePath) {
        const parts = relativePath.split(/[/\\]/);
        const prefixIndex = parts.indexOf(stripPrefix);
        if (prefixIndex !== -1) {
          outputRelativePath = parts
            .slice(0, prefixIndex)
            .concat(parts.slice(prefixIndex + 1))
            .join('/');
        }
      }
    }

    // Change extension to output format
    const outputFilePath = path.join(
      outputDirectory,
      path.dirname(outputRelativePath),
      `${path.basename(outputRelativePath, path.extname(outputRelativePath))}.${format}`
    );

    outputFiles.push(outputFilePath);
  }

  return outputFiles;
}
