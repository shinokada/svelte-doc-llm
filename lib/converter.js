import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { ensureDirectoryExists } from './fileSystem.js';
import { includeFiles } from './processors/include-files.js';
import {
  processCodeBlocks,
  removeScriptSection,
  processComponentDataSection,
  processSeeAlsoSection,
  removeSections
} from './processors/index.js';

/**
 * Generate context-full.txt file by concatenating all processed files in specified order
 * @param {Array<Object>} processedFiles - Array of processed file info
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
export async function generateContextFull (processedFiles, config) {
  try {

    const { outDir, contextOrder = ['pages', 'components', 'forms', 'typography', 'extend', 'utilities'] } = config;

    console.log(`Starting context-full.txt generation with ${processedFiles.length} files`);
    console.log(`Output directory: ${outDir}`);

    // Group files by their directory (first part of relative path after 'docs')
    const filesByCategory = {};

    console.log('Processing files for context generation...');

    for (const file of processedFiles) {
      // Extract category from relative path (e.g., 'docs/components/alert.md' -> 'components')
      const pathParts = file.relativePath.split(/[\\/]/).filter(Boolean);
      let category = 'other'; // default category

      // Find the category in the path
      if (pathParts.length > 0) {
        // Remove 'docs' if it's the first part
        const startIndex = pathParts[0] === 'docs' ? 1 : 0;
        if (pathParts.length > startIndex) {
          category = pathParts[startIndex];
        }
      }

      console.log(`File: ${file.relativePath} -> Category: ${category}`);

      if (!filesByCategory[category]) {
        filesByCategory[category] = [];
      }
      filesByCategory[category].push(file);
    }

    console.log('Categories found:', Object.keys(filesByCategory));
    console.log('Files by category:', Object.fromEntries(
      Object.entries(filesByCategory).map(([cat, files]) => [cat, files.length])
    ));

    // Sort files within each category alphabetically
    for (const category in filesByCategory) {
      filesByCategory[category].sort((a, b) => a.relativePath.localeCompare(b.relativePath));
    }

    let contextContent = `# ${config.pkgName} Documentation - Full Context
# Generated on ${new Date().toISOString()}
# This file contains all documentation concatenated in logical order

`;

    const failedFiles = [];
    // Process categories in the specified order
    for (const category of contextOrder) {
      if (filesByCategory[category] && filesByCategory[category].length > 0) {
        contextContent += `\n# ===== ${category.toUpperCase()} =====\n\n`;

        for (const file of filesByCategory[category]) {
          try {
            // Read the processed file content
            const fileContent = await fs.readFile(file.outputPath, 'utf8');
            contextContent += `<!-- Source: ${file.relativePath} -->\n`;
            contextContent += fileContent;
            contextContent += '\n\n---\n\n';
          } catch (error) {
            console.error(`Error reading file ${file.outputPath}:`, error.message);
            failedFiles.push(file.relativePath);
          }
        }
      }
    }

    // Add any remaining categories not in the specified order
    for (const category in filesByCategory) {
      if (!contextOrder.includes(category)) {
        contextContent += `\n# ===== ${category.toUpperCase()} =====\n\n`;

        for (const file of filesByCategory[category]) {
          try {
            const fileContent = await fs.readFile(file.outputPath, 'utf8');
            contextContent += `<!-- Source: ${file.relativePath} -->\n`;
            contextContent += fileContent;
            contextContent += '\n\n---\n\n';
          } catch (error) {
            console.error(`Error reading file ${file.outputPath}:`, error.message);
          }
        }
      }
    }

    if (failedFiles.length > 0) {
      console.warn(`⚠️  Warning: ${failedFiles.length} file(s) could not be included in context-full.txt:`);
      failedFiles.forEach(f => console.warn(`  - ${f}`));
    }

    // Write context-full.txt to the same directory as processed files (to match llms.txt URLs)
    const contextPath = path.resolve(process.cwd(), outDir, 'context-full.txt');

    // Ensure the output directory exists
    await ensureDirectoryExists(path.dirname(contextPath));

    console.log(`Writing context-full.txt to: ${contextPath}`);
    await fs.writeFile(contextPath, contextContent);
    console.log(`Generated context-full.txt at ${contextPath}`);

    // Log statistics
    const totalFiles = processedFiles.length;
    const totalSize = Buffer.byteLength(contextContent, 'utf8');
    console.log(`Context file contains ${totalFiles} documents, ${Math.round(totalSize / 1024)} KB`);

  } catch (error) {
    console.error('Error generating context-full.txt:', error);
    throw error;
  }
}

/**
 * Process a collection of markdown files
 * @param {Array<string>} files - Array of file paths
 * @param {Object} config - Configuration object
 * @returns {Promise<Array<Object>>} - Array of processed file info
 */
export async function processFiles (files, config) {
  const { outDir, ignore, dataDir, format, stripPrefix } = config;
  const outputDirectory = path.resolve(process.cwd(), outDir);

  const processedFiles = [];

  // Process each file
  for (const file of files) {
    const result = await processFile(file, outputDirectory, ignore, dataDir, format, stripPrefix, config);
    if (result) {
      processedFiles.push(result);
    }
  }

  return processedFiles;
}

/**
 * Process a single markdown file
 * @param {string} filePath - Path to the markdown file
 * @param {string} outputDir - Output directory path
 * @param {Array<string>} ignoreList - List of sections to ignore
 * @param {string} dataDir - Component data directory
 * @param {string} format - Output file format
 * @param {string} stripPrefix - Prefix to strip from output path
 * @param {Object} config - Full configuration object
 * @returns {Promise<Object|null>} - Processed file info or null if error
 */
async function processFile (filePath, outputDir, ignoreList, dataDir, format, stripPrefix, config) {
  try {
    console.log(`Processing ${filePath}...`);

    // Read file content
    const content = await fs.readFile(filePath, 'utf8');

    // Parse frontmatter
    const { data, content: markdownContent } = matter(content);
    const { title, component_title } = data;

    // Process content
    let processedContent = '';

    // Add title as H1
    if (title) {
      processedContent += `# ${title}\n\n`;
    }

    // Process markdown content - pass the current file path and config
    processedContent += await processMarkdown(markdownContent, component_title, ignoreList, dataDir, filePath, config);

    // Generate output file path
    const relativePath = path.relative(path.resolve(process.cwd(), config.srcDir || 'src/routes'), filePath);

    // Apply stripPrefix if configured
    let outputRelativePath = applyStripPrefix(relativePath, stripPrefix);

    // Change the extension to the format specified in config
    const outputFilePath = path.join(
      outputDir,
      path.dirname(outputRelativePath),
      `${path.basename(outputRelativePath, path.extname(outputRelativePath))}.${format}`
    );

    // Create directory if it doesn't exist
    await ensureDirectoryExists(path.dirname(outputFilePath));

    // Write output file
    await fs.writeFile(outputFilePath, processedContent);
    console.log(`Output written to ${outputFilePath}`);

    // Return info about the processed file
    return {
      inputPath: filePath,
      outputPath: outputFilePath,
      relativePath: outputRelativePath,
      title: title || component_title
    };

  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Generate llms.txt file
 * @param {Array<Object>} processedFiles - Array of processed file info
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
export async function generateLlmsTxt (processedFiles, config) {
  const { baseUrl, repo } = config;

  // Sort files by their relative path for consistent ordering
  const sortedFiles = [...processedFiles].sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  let llmsTxt = `# llms.txt
# Documentation index for LLMs
# See https://llmstxt.org for details
version: 1
llms: markdown

# Main documentation sections
`;

  const fmt = (config.format || 'md').toLowerCase();
  const base = (baseUrl || '').replace(/\/+$/, '');
  for (const file of sortedFiles) {
    const urlPath = file.relativePath
      .replace(/\\/g, '/')
      .replace(/\.[^.]+$/, `.${fmt}`);
    const fullUrl = `${base}/${urlPath}`;
    llmsTxt += `/docs: ${fullUrl}\n`;
  }

  // Add optional context bundles section
  llmsTxt += `
# Optionally point to bundles
/context: ${base}/context-full.txt

# Contact or repo for updates
repo: ${repo}
`;

  // Write llms.txt to static directory
  const staticDir = path.resolve(process.cwd(), 'static');
  await ensureDirectoryExists(staticDir);
  const llmsTxtPath = path.join(staticDir, 'llms.txt');
  await fs.writeFile(llmsTxtPath, llmsTxt);
  console.log(`Generated llms.txt at ${llmsTxtPath}`);
}

/**
 * Apply strip prefix to a path
 * @param {string} relativePath - Relative file path
 * @param {string} stripPrefix - Prefix to strip
 * @returns {string} - Path with prefix stripped
 */
function applyStripPrefix (relativePath, stripPrefix) {
  let outputRelativePath = relativePath;

  if (stripPrefix && typeof stripPrefix === 'string' && stripPrefix.trim() !== '') {
    // Escape regex metacharacters in prefix, then normalize slashes to match both / and \
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const prefixPattern = new RegExp(`^${esc(stripPrefix).replace(/[\/\\]/g, '[\\/\\\\]')}[\\/\\\\]`);
    outputRelativePath = relativePath.replace(prefixPattern, '');

    // If path didn't change, the prefix might be in a parent directory
    if (outputRelativePath === relativePath) {
      const parts = relativePath.split(/[\/\\]/);
      const prefixIndex = parts.indexOf(stripPrefix);
      if (prefixIndex !== -1) {
        outputRelativePath = parts.slice(0, prefixIndex).concat(parts.slice(prefixIndex + 1)).join('/');
      }
    }
  }

  return outputRelativePath;
}

/**
 * Process markdown content
 * @param {string} content - Markdown content
 * @param {string} componentTitle - Title of the component
 * @param {Array<string>} ignoreList - List of sections to ignore
 * @param {string} dataDir - Component data directory
 * @param {string} currentFilePath - Current file being processed (needed for include resolution)
 * @param {Object} config - Full configuration object
 * @returns {Promise<string>} - Processed content
 */
async function processMarkdown (content, componentTitle, ignoreList, dataDir, currentFilePath, config) {
  // Extract paths from config with defaults
  const {
    docsDir = 'src/routes',
    examplesDir = 'src/routes/docs-examples'
  } = config;

  // Process code blocks
  content = processCodeBlocks(content);

  // Process {#include filepath} with file content
  const includeProcessor = includeFiles({
    extensions: ['.md', '.svelte'],
    docsDir: path.resolve(process.cwd(), docsDir),
    examplesDir: path.resolve(process.cwd(), examplesDir)
  });

  // Use the include processor - we need to provide a filename for path resolution
  const { code: includedContent, dependencies = [] } = includeProcessor.markup({
    content,
    filename: currentFilePath
  });
  if (dependencies.length > 0) {
    console.log(`  Included ${dependencies.length} file(s) from ${currentFilePath}`);
  }
  content = includedContent;

  // Remove sections to ignore
  content = removeSections(content, ignoreList);

  // Process "See also" section
  content = await processSeeAlsoSection(content);

  // Process "Component data" section
  content = await processComponentDataSection(content, componentTitle, dataDir);

  // Remove script section
  content = removeScriptSection(content);

  // Remove <GitHubCompoLinks />
  content = content.replace(/<GitHubCompoLinks\s*\/>/g, '');

  return content;
}