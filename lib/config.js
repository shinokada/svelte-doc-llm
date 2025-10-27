import path from 'path';

/**
 * Load configuration for the markdown-to-llm converter
 * @returns {Promise<Object>} The merged configuration
 */
export async function loadConfig() {
  // Default configuration
  const defaultConfig = {
    srcDir: "./src/routes/docs",
    outDir: "./static/llm",
    format: "md",
    dataDir: "./src/routes/component-data",
    ignore: [],
    stripPrefix: "docs",
    cleanOutDir: true,
    // Required fields - must be provided in llm.config.js
    baseUrl: null,
    repo: null,
    pkgName: null,
    // Optional fields
    contextOrder: ['pages', 'components', 'forms', 'typography', 'extend', 'utilities'],
    docsDir: 'src/routes',
    examplesDir: 'src/routes/docs-examples'
  };
  
  // Load configuration
  const configPath = path.resolve(process.cwd(), 'llm.config.js');
  let config = { ...defaultConfig };
  
  try {
    const loadedConfig = await import(configPath);
    // Merge loaded config with default config
    config = { ...defaultConfig, ...(loadedConfig.default || loadedConfig) };
    console.log('Loaded configuration from llm.config.js.');
  } catch (error) {
    console.warn('Warning: Some required fields (baseUrl, repo, pkgName) may be missing.');
    console.warn('Warning: Some required fields (baseUrl, repo, pkgName) may be missing.');
  }
  
  // Normalize ignore to array if it's a string
  if (!Array.isArray(config.ignore)) {
    config.ignore = config.ignore ? [config.ignore] : [];
  }
  
  // Validate required fields
  const errors = [];
  if (!config.baseUrl) {
    errors.push('baseUrl is required in llm.config.js (e.g., "https://yoursite.com/llm")');
  }
  if (!config.repo) {
    errors.push('repo is required in llm.config.js (e.g., "https://github.com/user/repo")');
  }
  if (!config.pkgName) {
    errors.push('pkgName is required in llm.config.js (e.g., "Your Package Name")');
  }
  
  if (errors.length > 0) {
    console.error('\n❌ Configuration errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    console.error('\nPlease create a llm.config.js file in your project root with these required fields.\n');
    throw new Error('Missing required configuration fields');
  }
  
  return config;
}