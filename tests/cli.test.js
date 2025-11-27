import { describe, it, expect, afterEach } from 'vitest';
import { parseArgs, validateOptions } from '../lib/cli.js';

describe('CLI Argument Parser', () => {
  // Save original argv
  const originalArgv = process.argv;

  // Helper to set mock arguments
  function setArgs(...args) {
    process.argv = ['node', 'svelte-doc-llm', ...args];
  }

  // Restore argv after each test
  afterEach(() => {
    process.argv = originalArgv;
  });

  describe('parseArgs', () => {
    it('should parse no arguments as default options', () => {
      setArgs();
      const options = parseArgs();
      expect(options).toEqual({
        directories: [],
        files: [],
        skipClean: false,
        help: false
      });
    });

    it('should parse -d flag with single directory', () => {
      setArgs('-d', 'components');
      const options = parseArgs();
      expect(options.directories).toEqual(['components']);
      expect(options.files).toEqual([]);
    });

    it('should parse -d flag with multiple directories', () => {
      setArgs('-d', 'components', 'forms', 'typography');
      const options = parseArgs();
      expect(options.directories).toEqual(['components', 'forms', 'typography']);
    });

    it('should parse --directories flag', () => {
      setArgs('--directories', 'components', 'forms');
      const options = parseArgs();
      expect(options.directories).toEqual(['components', 'forms']);
    });

    it('should parse -f flag with single file', () => {
      setArgs('-f', 'components/alert.md');
      const options = parseArgs();
      expect(options.files).toEqual(['components/alert.md']);
      expect(options.directories).toEqual([]);
    });

    it('should parse -f flag with multiple files', () => {
      setArgs('-f', 'components/alert.md', 'components/button.md', 'forms/input.md');
      const options = parseArgs();
      expect(options.files).toEqual([
        'components/alert.md',
        'components/button.md',
        'forms/input.md'
      ]);
    });

    it('should parse --files flag', () => {
      setArgs('--files', 'components/alert.md', 'forms/input.md');
      const options = parseArgs();
      expect(options.files).toEqual(['components/alert.md', 'forms/input.md']);
    });

    it('should parse both -d and -f flags together', () => {
      setArgs('-d', 'components', 'forms', '-f', 'typography/text.md');
      const options = parseArgs();
      expect(options.directories).toEqual(['components', 'forms']);
      expect(options.files).toEqual(['typography/text.md']);
    });

    it('should parse --skip-clean flag', () => {
      setArgs('--skip-clean');
      const options = parseArgs();
      expect(options.skipClean).toBe(true);
    });

    it('should parse -h flag', () => {
      setArgs('-h');
      const options = parseArgs();
      expect(options.help).toBe(true);
    });

    it('should parse --help flag', () => {
      setArgs('--help');
      const options = parseArgs();
      expect(options.help).toBe(true);
    });

    it('should parse complex combination of flags', () => {
      setArgs('-d', 'components', '-f', 'forms/input.md', '--skip-clean');
      const options = parseArgs();
      expect(options.directories).toEqual(['components']);
      expect(options.files).toEqual(['forms/input.md']);
      expect(options.skipClean).toBe(true);
    });

    it('should handle unknown flags gracefully', () => {
      setArgs('-d', 'components', '--unknown-flag', '-f', 'test.md');
      const options = parseArgs();
      expect(options.directories).toEqual(['components']);
      expect(options.files).toEqual(['test.md']);
    });
  });

  describe('validateOptions', () => {
    it('should validate empty options', () => {
      const options = { directories: [], files: [] };
      expect(validateOptions(options)).toBe(true);
    });

    it('should validate valid directory paths', () => {
      const options = {
        directories: ['components', 'forms/advanced', 'docs/guides'],
        files: []
      };
      expect(validateOptions(options)).toBe(true);
    });

    it('should validate valid file paths', () => {
      const options = {
        directories: [],
        files: ['components/alert.md', 'forms/input.md']
      };
      expect(validateOptions(options)).toBe(true);
    });

    it('should reject paths with invalid characters in directories', () => {
      const options = {
        directories: ['components<test>'],
        files: []
      };
      expect(validateOptions(options)).toBe(false);
    });

    it('should reject paths with invalid characters in files', () => {
      const options = {
        directories: [],
        files: ['components/alert|test.md']
      };
      expect(validateOptions(options)).toBe(false);
    });
  });
});
