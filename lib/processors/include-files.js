import fs from 'fs';
import path from 'path';

export function includeFiles({ extensions = [], docsDir = '', examplesDir = '' } = {}) {
  const docsRoot = path.resolve(docsDir);
  const exampleRoot = path.resolve(examplesDir);

  return {
    name: 'include-files',
    markup({ content, filename }) {
      if (!filename) {
        return { code: content };
      }

      const { dir, name, ext } = path.parse(filename);
      const okExt = extensions.map(e => e.toLowerCase());
      if (!okExt.includes(ext.toLowerCase())) {
        return { code: content };
      }

      const relativeDir = path.relative(docsRoot, dir);
      // '../abc' skip files outside of docsRoot tree
      if (relativeDir.startsWith('..')) {
        return { code: content };
      }

      try {
        const deps = new Set();
        const processedContent = content.replace(/{#include\s+([^\s}]+)}/g, (match, filepath) => {
          try {
            // Resolve path relative to the examples tree and enforce containment
            if (path.isAbsolute(filepath)) {
              console.warn(`Absolute include paths are not allowed: ${filepath}`);
              return `<!-- Absolute include paths are not allowed: ${filepath} -->`;
            }

            // Build the full path based on the directory structure
            // For src/routes/docs/forms/toggle.md including Default.svelte,
            // look in src/routes/docs-examples/forms/toggle/Default.svelte

            // Extract the category and component name from the relative directory path
            const pathParts = relativeDir.split(path.sep).filter(part => part !== '');
            // Remove 'docs' from the path parts to get the category path
            const docsIndex = pathParts.indexOf('docs');
            const categoryPath = docsIndex !== -1 ? pathParts.slice(docsIndex + 1) : pathParts;

            const componentName = name; // e.g., "toggle"
            const fullPath = path.resolve(exampleRoot, ...categoryPath, componentName, filepath);

            // Ensure the path is within examplesDir
            const relativePath = path.relative(exampleRoot, fullPath);
            if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
              console.warn(`Include path escapes examplesDir: ${fullPath}`);
              return `<!-- Include path escapes examplesDir: ${filepath} -->`;
            }

            // Check if file exists
            if (!fs.existsSync(fullPath)) {
              console.warn(`Include file not found: ${fullPath}`);
              return `<!-- File not found: ${filepath} (looked in ${fullPath}) -->`;
            }

            const fileContent = fs.readFileSync(fullPath, 'utf-8').trimEnd();
            deps.add(fullPath);

            return fileContent;
          } catch (error) {
            console.error(`Error including file ${filepath}:`, error);
            return `<!-- Error including file: ${filepath} -->`;
          }
        });

        return { code: processedContent, dependencies: Array.from(deps) };
      } catch (error) {
        console.error('Error in include-files preprocessor:', error);
        return { code: content };
      }
    }
  };
}
