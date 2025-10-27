import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cleanDirectory, cleanDirectoryCompletely, ensureDirectoryExists } from '../lib/fileSystem.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
  
describe('fileSystem utilities', () => {
  const testDirRoot = path.resolve(os.tmpdir(), 'sdl-e2e-');
  let testDir;
  
  beforeEach(async () => {
    testDir = await fs.mkdtemp(testDirRoot);
    await ensureDirectoryExists(testDir);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {}
  });

  describe('ensureDirectoryExists', () => {
    it('should create directory if it does not exist', async () => {
      const newDir = path.join(testDir, 'new-folder');
      await ensureDirectoryExists(newDir);
      
      const stats = await fs.stat(newDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should not fail if directory already exists', async () => {
      await ensureDirectoryExists(testDir);
      await expect(ensureDirectoryExists(testDir)).resolves.toBeTruthy();
    });

    it('should create nested directories', async () => {
      const nestedDir = path.join(testDir, 'level1', 'level2', 'level3');
      await ensureDirectoryExists(nestedDir);
      
      const stats = await fs.stat(nestedDir);
      expect(stats.isDirectory()).toBe(true);
    });
  });
  
  it('should remove files regardless of extension case', async () => {
      await fs.writeFile(path.join(testDir, 'a.MD'), 'x');
      await fs.writeFile(path.join(testDir, 'b.md'), 'x');
      await fs.writeFile(path.join(testDir, 'c.TXT'), 'x');
      await cleanDirectory(testDir, 'mD');
      await expect(fs.access(path.join(testDir, 'a.MD'))).rejects.toThrow();
      await expect(fs.access(path.join(testDir, 'b.md'))).rejects.toThrow();
      await expect(fs.access(path.join(testDir, 'c.TXT'))).resolves.toBeUndefined();
    });

  describe('cleanDirectory', () => {
    it('should remove only files with specified format', async () => {
      // Create test files
      await fs.writeFile(path.join(testDir, 'file1.md'), 'content');
      await fs.writeFile(path.join(testDir, 'file2.txt'), 'content');
      await fs.writeFile(path.join(testDir, 'file3.md'), 'content');
      
      await cleanDirectory(testDir, 'md');
      
      // Check .md files are removed
      await expect(fs.access(path.join(testDir, 'file1.md'))).rejects.toThrow();
      await expect(fs.access(path.join(testDir, 'file3.md'))).rejects.toThrow();
      
      // Check .txt file remains
      await expect(fs.access(path.join(testDir, 'file2.txt'))).resolves.toBeUndefined();
    });

    it('should handle nested directories', async () => {
      const subDir = path.join(testDir, 'subdir');
      await ensureDirectoryExists(subDir);
      await fs.writeFile(path.join(subDir, 'nested.md'), 'content');
      
      await cleanDirectory(testDir, 'md');
      
      // Check nested .md file is removed
      await expect(fs.access(path.join(subDir, 'nested.md'))).rejects.toThrow();
      
      // Check subdirectory still exists
      const stats = await fs.stat(subDir);
      expect(stats.isDirectory()).toBe(true);
    });

    it('should create directory if it does not exist', async () => {
      const nonExistent = path.join(testDir, 'non-existent');
      await cleanDirectory(nonExistent, 'md');
      
      const stats = await fs.stat(nonExistent);
      expect(stats.isDirectory()).toBe(true);
    });
  });

  describe('cleanDirectoryCompletely', () => {
    it('should remove all files and subdirectories', async () => {
      // Create structure
      await fs.writeFile(path.join(testDir, 'file1.md'), 'content');
      await fs.writeFile(path.join(testDir, 'file2.txt'), 'content');
      
      const subDir = path.join(testDir, 'subdir');
      await ensureDirectoryExists(subDir);
      await fs.writeFile(path.join(subDir, 'nested.md'), 'content');
      
      await cleanDirectoryCompletely(testDir);
      
      // Check all files are removed
      const files = await fs.readdir(testDir);
      expect(files).toHaveLength(0);
    });

    it('should create directory if it does not exist', async () => {
      const nonExistent = path.join(testDir, 'non-existent-clean');
      const result = await cleanDirectoryCompletely(nonExistent);
      
      expect(result).toBe(true);
      const stats = await fs.stat(nonExistent);
      expect(stats.isDirectory()).toBe(true);
    });
  });
});