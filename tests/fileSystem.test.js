import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  cleanDirectory,
  cleanDirectoryCompletely,
  ensureDirectoryExists
} from '../lib/fileSystem.js';
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
    } catch (err) {
      console.warn('Cleanup failed:', err);
    }
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

    it('should remove files regardless of extension case', async () => {
      await fs.writeFile(path.join(testDir, 'a.MD'), 'x');
      await fs.writeFile(path.join(testDir, 'b.md'), 'x');
      await fs.writeFile(path.join(testDir, 'c.TXT'), 'x');
      await cleanDirectory(testDir, 'mD');
      await expect(fs.access(path.join(testDir, 'a.MD'))).rejects.toThrow();
      await expect(fs.access(path.join(testDir, 'b.md'))).rejects.toThrow();
      await expect(fs.access(path.join(testDir, 'c.TXT'))).resolves.toBeUndefined();
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

    it('should preserve ignored directories at top level', async () => {
      // Create structure
      await fs.writeFile(path.join(testDir, 'file1.md'), 'content');

      const ignoredDir = path.join(testDir, '[...slug]');
      await ensureDirectoryExists(ignoredDir);
      await fs.writeFile(path.join(ignoredDir, 'preserved.md'), 'content');

      const normalDir = path.join(testDir, 'normal');
      await ensureDirectoryExists(normalDir);
      await fs.writeFile(path.join(normalDir, 'removed.md'), 'content');

      await cleanDirectoryCompletely(testDir, ['[...slug]']);

      // Check ignored directory and its contents are preserved
      const stats = await fs.stat(ignoredDir);
      expect(stats.isDirectory()).toBe(true);
      await expect(fs.access(path.join(ignoredDir, 'preserved.md'))).resolves.toBeUndefined();

      // Check other files and directories are removed
      await expect(fs.access(path.join(testDir, 'file1.md'))).rejects.toThrow();
      await expect(fs.access(normalDir)).rejects.toThrow();
    });

    it('should preserve ignored directories at nested levels', async () => {
      // Create nested structure: testDir/parent/child/[...slug]/file.md
      const parentDir = path.join(testDir, 'parent');
      const childDir = path.join(parentDir, 'child');
      const ignoredDir = path.join(childDir, '[...slug]');

      await ensureDirectoryExists(ignoredDir);
      await fs.writeFile(path.join(ignoredDir, 'preserved.md'), 'nested content');

      // Add some files to be deleted
      await fs.writeFile(path.join(parentDir, 'delete-me.md'), 'content');
      await fs.writeFile(path.join(childDir, 'also-delete.md'), 'content');

      await cleanDirectoryCompletely(testDir, ['[...slug]']);

      // Check ignored directory and its contents are preserved
      const stats = await fs.stat(ignoredDir);
      expect(stats.isDirectory()).toBe(true);
      await expect(fs.access(path.join(ignoredDir, 'preserved.md'))).resolves.toBeUndefined();

      // Check parent directories are kept because they contain the ignored dir
      await expect(fs.access(parentDir)).resolves.toBeUndefined();
      await expect(fs.access(childDir)).resolves.toBeUndefined();

      // Check other files are removed
      await expect(fs.access(path.join(parentDir, 'delete-me.md'))).rejects.toThrow();
      await expect(fs.access(path.join(childDir, 'also-delete.md'))).rejects.toThrow();
    });

    it('should handle multiple ignored directories', async () => {
      // Create multiple ignored dirs
      const ignored1 = path.join(testDir, '[...slug]');
      const ignored2 = path.join(testDir, 'custom-dir');
      const normal = path.join(testDir, 'normal');

      await ensureDirectoryExists(ignored1);
      await ensureDirectoryExists(ignored2);
      await ensureDirectoryExists(normal);

      await fs.writeFile(path.join(ignored1, 'file1.md'), 'content');
      await fs.writeFile(path.join(ignored2, 'file2.md'), 'content');
      await fs.writeFile(path.join(normal, 'file3.md'), 'content');

      await cleanDirectoryCompletely(testDir, ['[...slug]', 'custom-dir']);

      // Check both ignored directories are preserved
      await expect(fs.access(ignored1)).resolves.toBeUndefined();
      await expect(fs.access(ignored2)).resolves.toBeUndefined();
      await expect(fs.access(path.join(ignored1, 'file1.md'))).resolves.toBeUndefined();
      await expect(fs.access(path.join(ignored2, 'file2.md'))).resolves.toBeUndefined();

      // Check normal directory is removed
      await expect(fs.access(normal)).rejects.toThrow();
    });

    it('should return false when preserved content exists', async () => {
      const ignoredDir = path.join(testDir, '[...slug]');
      await ensureDirectoryExists(ignoredDir);
      await fs.writeFile(path.join(ignoredDir, 'file.md'), 'content');

      const isEmpty = await cleanDirectoryCompletely(testDir, ['[...slug]']);

      expect(isEmpty).toBe(false);
    });

    it('should return true when no preserved content exists', async () => {
      await fs.writeFile(path.join(testDir, 'file.md'), 'content');

      const isEmpty = await cleanDirectoryCompletely(testDir, ['[...slug]']);

      expect(isEmpty).toBe(true);
    });
  });
});
