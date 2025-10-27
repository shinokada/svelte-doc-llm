/**
 * Configuration for markdown-to-llm converter
 */
export default {
  // Source directory for markdown files
  srcDir: "./src/routes/docs",
  
  // Output directory for processed files
  outDir: "./static/llm",
  
  // Output file format
  format: "md",
  
  // Directory for component data
  dataDir: "./src/routes/component-data",
  
  // Sections to ignore (can be string or array)
  ignore: [
    "GitHub Links",
    "LLM Link"
  ],
  
  // Strip this prefix from output paths
  stripPrefix: "docs",
  
  // Whether to completely clean the output directory (delete all files and subdirectories)
  cleanOutDir: true,
  
  // Base URL where the contents of `outDir` are served (REQUIRED for llms.txt).
  // It should resolve to the deployed path of ./static/llm.
  // Trailing slash is optional; the tool will normalize it.
  baseUrl: 'https://flowbite-svelte.com/llm',  
  
  // Repository URL (REQUIRED for llms.txt)
  repo: 'https://github.com/themesberg/flowbite-svelte',  
  
  // Order for concatenating files in context-full.txt
  contextOrder: ['pages', 'components', 'forms', 'typography', 'extend', 'utilities'],

  // Additional paths
  docsDir: 'src/routes',
  examplesDir: 'src/routes/docs-examples',
  
  // Package name
  pkgName: 'Flowbite Svelte',  // Add this!
};