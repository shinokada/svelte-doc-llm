import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadConfig } from '../lib/config.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('loadConfig', () => {
  const configPath = path.resolve(process.cwd(), 'llm.config.js');
  let originalConfig = null;
  let testDir = null;
  let originalCwd = null;

  beforeEach(async () => {
    // Backup existing config if it exists
    try {
      originalConfig = await fs.readFile(configPath, 'utf8');
    } catch (err) {
      originalConfig = null;
    }
  });

  afterEach(async () => {
    // Restore original config or remove test config
    try {
      if (originalConfig) {
        await fs.writeFile(configPath, originalConfig);
      } else {
        await fs.unlink(configPath);
      }
    } catch (err) {
      // Ignore cleanup errors
    }
    
    // Restore original working directory if changed
    if (originalCwd) {
      process.chdir(originalCwd);
      originalCwd = null;
    }
    
    // Clean up test directory
    if (testDir) {
      try {
        await fs.rm(testDir, { recursive: true, force: true });
      } catch (err) {
        // Ignore cleanup errors
      }
      testDir = null;
    }
    
    // Clear module cache to ensure fresh imports
    const moduleId = path.resolve(process.cwd(), 'llm.config.js');
    delete require.cache[moduleId];
  });

  it('should load and merge config from llm.config.js', async () => {
    // This test uses the actual project config
    const config = await loadConfig();

    expect(config).toHaveProperty('srcDir');
    expect(config).toHaveProperty('outDir');
    expect(config).toHaveProperty('format');
    expect(config).toHaveProperty('baseUrl');
    expect(config).toHaveProperty('repo');
    expect(config).toHaveProperty('pkgName');
  });

  it('should normalize ignore field to array', async () => {
    const config = await loadConfig();
    
    // The ignore field should always be normalized to an array
    expect(Array.isArray(config.ignore)).toBe(true);
    expect(Array.isArray(config.ignoreDirs)).toBe(true);
  });

  it('should throw error when required fields are missing', async () => {
    // Create a temporary directory for isolated test
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'config-test-'));
    originalCwd = process.cwd();
    process.chdir(testDir);
    
    // Create config missing required fields in the temp directory
    await fs.writeFile(
      path.join(testDir, 'llm.config.js'),
      `export default {
        srcDir: './src'
        // Missing baseUrl, repo, pkgName
      };`
    );

    await expect(loadConfig()).rejects.toThrow('Missing required configuration fields');
  });
});
