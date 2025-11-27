import fs from 'fs/promises';
import path from 'path';
const DEBUG = process.env.DEBUGFILESYSTEM === 'true';

/**
 * Clean specific files from the output directory
 * @param {Array<string>} filePaths - Array of file paths to remove
 */
export async function cleanSpecificFiles(filePaths) {
  try {
    let removedCount = 0;
    for (const filePath of filePaths) {
      try {
        await fs.access(filePath);
        await fs.unlink(filePath);
        removedCount++;
        if (DEBUG) {
          console.log(`Removed file: ${filePath}`);
        }
      } catch (err) {
        // File doesn't exist, skip silently
        if (DEBUG && err.code !== 'ENOENT') {
          console.warn(`Could not remove ${filePath}:`, err.message);
        }
      }
    }
    if (DEBUG && removedCount > 0) {
      console.log(`Removed ${removedCount} specific file(s)`);
    }
  } catch (error) {
    console.error('Error cleaning specific files:', error.message);
    throw error;
  }
}
/**
 * Clean directory by removing only files with the specified format
 * @param {string} directoryPath - Path to the directory to clean
 * @param {string} format - File format to remove (e.g., 'md', 'txt')
 */
export async function cleanDirectory(directoryPath, format) {
  try {
    // Check if directory exists
    try {
      await fs.access(directoryPath);
    } catch (_) {
      // Directory doesn't exist, create it
      await fs.mkdir(directoryPath, { recursive: true });
      return; // Nothing to clean
    }

    // Read directory contents
    const items = await fs.readdir(directoryPath, { withFileTypes: true });

    // Process each item
    for (const item of items) {
      const itemPath = path.join(directoryPath, item.name);

      if (item.isDirectory()) {
        // Recursively clean files in subdirectory but keep the directory
        await cleanDirectory(itemPath, format);
      } else {
        // Check if file has the specified format extension
        if (item.name.toLowerCase().endsWith(`.${format.toLowerCase()}`)) {
          // Remove file with matching format
          await fs.unlink(itemPath);
          if (DEBUG) {
            console.log(`Removed file: ${itemPath}`);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error cleaning directory ${directoryPath}:`, error.message);
    throw error;
  }
}

/**
 * Completely clean a directory by removing all files and subdirectories
 * @param {string} directoryPath - Path to the directory to clean
 * @param {Array<string>} ignoreDirs - Array of directory names to preserve
 * @returns {Promise<boolean>} - True if directory is now empty (can be removed), false if it contains preserved content
 */
export async function cleanDirectoryCompletely(directoryPath, ignoreDirs = []) {
  try {
    // Check if directory exists
    try {
      await fs.access(directoryPath);
    } catch (_) {
      // Directory doesn't exist, create it
      await fs.mkdir(directoryPath, { recursive: true });
      return true; // Nothing to clean, directory is empty
    }

    // Read directory contents
    const items = await fs.readdir(directoryPath, { withFileTypes: true });
    let hasPreservedContent = false;

    // Process each item
    for (const item of items) {
      const itemPath = path.join(directoryPath, item.name);

      if (item.isDirectory()) {
        // Check if this directory should be ignored
        if (ignoreDirs.includes(item.name)) {
          if (DEBUG) {
            console.log(`Skipping ignored directory: ${itemPath}`);
          }
          hasPreservedContent = true;
          continue;
        }
        // Recursively remove subdirectory and all its contents
        const isEmpty = await cleanDirectoryCompletely(itemPath, ignoreDirs);
        if (isEmpty) {
          // Only remove the directory if it's empty after cleaning
          await fs.rmdir(itemPath);
          if (DEBUG) {
            console.log(`Removed directory: ${itemPath}`);
          }
        } else {
          // Directory contains preserved content, so we keep it
          hasPreservedContent = true;
          if (DEBUG) {
            console.log(`Keeping directory (contains preserved content): ${itemPath}`);
          }
        }
      } else {
        // Remove file
        await fs.unlink(itemPath);
        if (DEBUG) {
          console.log(`Removed file: ${itemPath}`);
        }
      }
    }

    return !hasPreservedContent;
  } catch (error) {
    console.error(`Error completely cleaning directory ${directoryPath}:`, error.message);
    throw error;
  }
}

/**
 * Ensure directory exists
 * @param {string} directoryPath - Path to the directory
 */
export async function ensureDirectoryExists(directoryPath) {
  try {
    await fs.mkdir(directoryPath, { recursive: true });
    return true;
  } catch (error) {
    console.error(`Error creating directory ${directoryPath}:`, error.message);
    throw error;
  }
}

/**
 * Load component data from JSON files
 * @param {string} componentTitle - The original title of the component
 * @param {string} componentDirName - Formatted directory name (lowercase with hyphens)
 * @param {string} dataDir - Directory path for component data
 * @returns {Promise<Array>} - Array of component data objects
 */
export async function loadComponentData(componentTitle, componentDirName, dataDir) {
  const componentsData = [];

  try {
    // Resolve the data directory path
    const dataDirectory = path.resolve(process.cwd(), dataDir);

    // First, identify the related component files in src/lib directory
    const componentDirPath = path.join('./src/lib', componentDirName);

    // Get list of Svelte files in the component directory
    let componentFiles;
    try {
      const files = await fs.readdir(componentDirPath);
      componentFiles = files.filter(file => file.endsWith('.svelte'));
      if (DEBUG) {
        console.log(`Found ${componentFiles.length} Svelte files in ${componentDirPath}`);
      }
    } catch (err) {
      if (DEBUG) {
        console.warn(
          `Warning: Could not read component directory ${componentDirPath}:`,
          err.message
        );
      }
      // Use PascalCase for the component file name (convert from title)
      const mainComponentName = componentTitle
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      componentFiles = [`${mainComponentName}.svelte`]; // Fallback to just the main component
      if (DEBUG) {
        console.log(`Using fallback component file: ${componentFiles[0]}`);
      }
    }

    // For each component file, load the corresponding JSON data from component-data directory
    for (const componentFile of componentFiles) {
      const componentName = componentFile.replace('.svelte', '');
      const jsonFilePath = path.join(dataDirectory, `${componentName}.json`);

      if (DEBUG) {
        console.log(`Looking for JSON data at: ${jsonFilePath}`);
      }

      try {
        const jsonData = await fs.readFile(jsonFilePath, 'utf8');
        const data = JSON.parse(jsonData);
        componentsData.push(data);
        if (DEBUG) {
          console.log(`Successfully loaded data for ${componentName}`);
        }
      } catch (err) {
        if (DEBUG) {
          console.warn(`Warning: Could not read JSON data for ${componentName}:`, err.message);
        }
      }
    }

    return componentsData;
  } catch (error) {
    console.error(`Error loading component data for ${componentTitle}:`, error.message);
    return [];
  }
}
