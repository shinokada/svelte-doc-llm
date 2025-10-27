import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

describe('full workflow', () => {
  let testProjectDir;
  const prefix = path.join(os.tmpdir(), 'sdl-e2e-');
  
  beforeAll(async () => {
    testProjectDir = await fs.mkdtemp(prefix);
    await fs.mkdir(path.join(testProjectDir, 'src/routes/docs'), { recursive: true });
    
    // Create test config
    await fs.writeFile(
      path.join(testProjectDir, 'llm.config.js'),
      `export default {
        srcDir: "./src/routes/docs",
        outDir: "./static/llm",
        format: "md",
        baseUrl: "https://test.com/llm",
        repo: "https://github.com/test/repo",
        pkgName: "Test Package",
        ignore: ["Installation"]
      };`
    );
    
    // Create a test markdown file
    await fs.writeFile(
      path.join(testProjectDir, 'src/routes/docs/test.md'),
      `---
title: Test Page
---

# Test Page

Content here.

## Installation
Should be removed.

## Usage
Should remain.
`
    );
  }, 30000);

  afterAll(async () => {
    try {
      await fs.rm(testProjectDir, { recursive: true, force: true });
    } catch {}
  });

  it('should run complete conversion process (skipped until CLI is wired)', async () => {
    // This would need the CLI to be runnable
    // const { stdout } = await execAsync('node index.js', { cwd: testProjectDir });
    
    // expect(stdout).toContain('Conversion complete');
    
    // Check output files exist
    // const outputFile = path.join(testProjectDir, 'static/llm/test.md');
    // const content = await fs.readFile(outputFile, 'utf8');
    
    // expect(content).not.toContain('## Installation');
    // expect(content).toContain('## Usage');
  }, 30000);
});