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
    stripPrefix: "docs"  // Strip this prefix from output paths by default
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
    console.log('No llm.config.js found or error loading it. Using default configuration.');
  }
  
  // Normalize ignore to array if it's a string
  if (!Array.isArray(config.ignore)) {
    config.ignore = config.ignore ? [config.ignore] : [];
  }
  
  return config;
}