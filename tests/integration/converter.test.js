import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { processFiles, generateLlmsTxt } from '../../lib/converter.js';
import fs from 'fs/promises';
import path from 'path';

describe('converter integration', () => {
  const testDir = path.resolve(process.cwd(), 'test-integration');
  const outputDir = path.join(testDir, 'output');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (err) {
      console.warn('Cleanup failed:', err);
    }
  });

  it('should process markdown files correctly', async () => {
    // Create a test markdown file
    const testMd = path.join(testDir, 'test.md');
    await fs.writeFile(
      testMd,
      `---
title: Test Document
---

# Test Heading

Some content here.

\`\`\`svelte example
<Component />
\`\`\`
`
    );

    const config = {
      outDir: outputDir,
      ignore: [],
      dataDir: './test-data',
      format: 'md',
      stripPrefix: '',
      docsDir: testDir,
      examplesDir: testDir
    };

    const results = await processFiles([testMd], config);

    expect(results).toHaveLength(1);
    expect(results[0]).toHaveProperty('outputPath');

    // Check output file was created
    const outputContent = await fs.readFile(results[0].outputPath, 'utf8');
    expect(outputContent).toContain('# Test Document');
    expect(outputContent).toContain('```svelte\n<Component />');
  });

  it('should generate valid llms.txt', async () => {
    const processedFiles = [
      {
        relativePath: 'components/alert.md',
        title: 'Alert'
      },
      {
        relativePath: 'components/badge.md',
        title: 'Badge'
      }
    ];

    const config = {
      outDir: outputDir,
      baseUrl: 'https://example.com/llm',
      repo: 'https://github.com/user/repo'
    };

    await generateLlmsTxt(processedFiles, config);

    const llmsTxtPath = path.resolve(process.cwd(), 'static/llms.txt');
    const content = await fs.readFile(llmsTxtPath, 'utf8');

    expect(content).toContain('version: 1');
    expect(content).toContain('https://example.com/llm/components/alert.md');
    expect(content).toContain('https://example.com/llm/components/badge.md');
    expect(content).toContain('repo: https://github.com/user/repo');

    // Clean up
    await fs.unlink(llmsTxtPath);
  });
});
