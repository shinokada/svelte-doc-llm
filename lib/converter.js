import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { ensureDirectoryExists } from './fileSystem.js';
import { 
  processCodeBlocks, 
  removeScriptSection,
  processComponentDataSection,
  processSeeAlsoSection,
  removeSections
} from './processors/index.js';

/**
 * Process a collection of markdown files
 * @param {Array<string>} files - Array of file paths
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
export async function processFiles(files, config) {
  const { outDir, ignore, dataDir, format, stripPrefix } = config;
  const outputDirectory = path.resolve(process.cwd(), outDir);
  
  // Process each file
  for (const file of files) {
    await processFile(file, outputDirectory, ignore, dataDir, format, stripPrefix);
  }
}

/**
 * Process a single markdown file
 * @param {string} filePath - Path to the markdown file
 * @param {string} outputDir - Output directory path
 * @param {Array<string>} ignoreList - List of sections to ignore
 * @param {string} dataDir - Component data directory
 * @param {string} format - Output file format
 * @param {string} stripPrefix - Prefix to strip from output path
 * @returns {Promise<void>}
 */
async function processFile(filePath, outputDir, ignoreList, dataDir, format, stripPrefix) {
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
    
    // Process markdown content
    processedContent += await processMarkdown(markdownContent, component_title, ignoreList, dataDir);
    
    // Generate output file path
    const relativePath = path.relative(path.resolve(process.cwd(), 'src/routes'), filePath);
    
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
    
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
  }
}

/**
 * Apply strip prefix to a path
 * @param {string} relativePath - Relative file path
 * @param {string} stripPrefix - Prefix to strip
 * @returns {string} - Path with prefix stripped
 */
function applyStripPrefix(relativePath, stripPrefix) {
  let outputRelativePath = relativePath;
  
  if (stripPrefix && typeof stripPrefix === 'string' && stripPrefix.trim() !== '') {
    // Create the pattern to match the prefix followed by a slash or backslash
    const prefixPattern = new RegExp(`^${stripPrefix.replace(/[\/\\]/g, '[\\/\\\\]')}[\\/\\\\]`);
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
 * @returns {Promise<string>} - Processed content
 */
async function processMarkdown(content, componentTitle, ignoreList, dataDir) {
  // Process code blocks
  content = processCodeBlocks(content);
  
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