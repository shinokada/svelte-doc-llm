import { describe, it, expect } from 'vitest';
import { filterFilesByOptions, getOutputFilesToClean } from '../lib/fileFilter.js';
import path from 'path';

describe('File Filter', () => {
  const mockSrcDir = '/project/src/routes/docs';
  const mockOutDir = '/project/src/routes/llm';

  describe('filterFilesByOptions', () => {
    it('should return all files when no filters specified', () => {
      const files = [
        path.join(mockSrcDir, 'components/alert.md'),
        path.join(mockSrcDir, 'forms/input.md'),
        path.join(mockSrcDir, 'typography/text.md')
      ];
      const options = { directories: [], files: [] };

      const result = filterFilesByOptions(files, options, mockSrcDir);
      expect(result).toEqual(files);
    });

    it('should filter by single directory', () => {
      const files = [
        path.join(mockSrcDir, 'components/alert.md'),
        path.join(mockSrcDir, 'components/button.md'),
        path.join(mockSrcDir, 'forms/input.md'),
        path.join(mockSrcDir, 'typography/text.md')
      ];
      const options = { directories: ['components'], files: [] };

      const result = filterFilesByOptions(files, options, mockSrcDir);
      expect(result).toHaveLength(2);
      expect(result).toContain(path.join(mockSrcDir, 'components/alert.md'));
      expect(result).toContain(path.join(mockSrcDir, 'components/button.md'));
    });

    it('should filter by multiple directories', () => {
      const files = [
        path.join(mockSrcDir, 'components/alert.md'),
        path.join(mockSrcDir, 'forms/input.md'),
        path.join(mockSrcDir, 'forms/checkbox.md'),
        path.join(mockSrcDir, 'typography/text.md')
      ];
      const options = { directories: ['components', 'forms'], files: [] };

      const result = filterFilesByOptions(files, options, mockSrcDir);
      expect(result).toHaveLength(3);
      expect(result).toContain(path.join(mockSrcDir, 'components/alert.md'));
      expect(result).toContain(path.join(mockSrcDir, 'forms/input.md'));
      expect(result).toContain(path.join(mockSrcDir, 'forms/checkbox.md'));
    });

    it('should filter by nested directory', () => {
      const files = [
        path.join(mockSrcDir, 'components/forms/advanced/input.md'),
        path.join(mockSrcDir, 'components/forms/basic/button.md'),
        path.join(mockSrcDir, 'components/layout/grid.md')
      ];
      const options = { directories: ['components/forms'], files: [] };

      const result = filterFilesByOptions(files, options, mockSrcDir);
      expect(result).toHaveLength(2);
      expect(result).toContain(path.join(mockSrcDir, 'components/forms/advanced/input.md'));
      expect(result).toContain(path.join(mockSrcDir, 'components/forms/basic/button.md'));
    });

    it('should filter by specific file', () => {
      const files = [
        path.join(mockSrcDir, 'components/alert.md'),
        path.join(mockSrcDir, 'components/button.md'),
        path.join(mockSrcDir, 'forms/input.md')
      ];
      const options = { directories: [], files: ['components/alert.md'] };

      const result = filterFilesByOptions(files, options, mockSrcDir);
      expect(result).toHaveLength(1);
      expect(result).toContain(path.join(mockSrcDir, 'components/alert.md'));
    });

    it('should filter by multiple files', () => {
      const files = [
        path.join(mockSrcDir, 'components/alert.md'),
        path.join(mockSrcDir, 'components/button.md'),
        path.join(mockSrcDir, 'forms/input.md'),
        path.join(mockSrcDir, 'typography/text.md')
      ];
      const options = {
        directories: [],
        files: ['components/alert.md', 'forms/input.md']
      };

      const result = filterFilesByOptions(files, options, mockSrcDir);
      expect(result).toHaveLength(2);
      expect(result).toContain(path.join(mockSrcDir, 'components/alert.md'));
      expect(result).toContain(path.join(mockSrcDir, 'forms/input.md'));
    });

    it('should handle files without extension in filter', () => {
      const files = [
        path.join(mockSrcDir, 'components/alert.md'),
        path.join(mockSrcDir, 'forms/input.md')
      ];
      const options = { directories: [], files: ['components/alert'] };

      const result = filterFilesByOptions(files, options, mockSrcDir);
      expect(result).toHaveLength(1);
      expect(result).toContain(path.join(mockSrcDir, 'components/alert.md'));
    });

    it('should combine directory and file filters', () => {
      const files = [
        path.join(mockSrcDir, 'components/alert.md'),
        path.join(mockSrcDir, 'components/button.md'),
        path.join(mockSrcDir, 'forms/input.md'),
        path.join(mockSrcDir, 'typography/text.md')
      ];
      const options = {
        directories: ['components'],
        files: ['typography/text.md']
      };

      const result = filterFilesByOptions(files, options, mockSrcDir);
      expect(result).toHaveLength(3);
      expect(result).toContain(path.join(mockSrcDir, 'components/alert.md'));
      expect(result).toContain(path.join(mockSrcDir, 'components/button.md'));
      expect(result).toContain(path.join(mockSrcDir, 'typography/text.md'));
    });

    it('should return empty array when no matches found', () => {
      const files = [
        path.join(mockSrcDir, 'components/alert.md'),
        path.join(mockSrcDir, 'forms/input.md')
      ];
      const options = { directories: ['nonexistent'], files: [] };

      const result = filterFilesByOptions(files, options, mockSrcDir);
      expect(result).toHaveLength(0);
    });
  });

  describe('getOutputFilesToClean', () => {
    it('should generate output file paths with format change', () => {
      const filteredFiles = [
        path.join(mockSrcDir, 'components/alert.md'),
        path.join(mockSrcDir, 'forms/input.md')
      ];
      const format = 'llm.md';
      const stripPrefix = 'docs';

      const result = getOutputFilesToClean(
        filteredFiles,
        mockSrcDir,
        mockOutDir,
        format,
        stripPrefix
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toContain('alert.llm.md');
      expect(result[1]).toContain('input.llm.md');
    });

    it('should apply stripPrefix correctly', () => {
      const filteredFiles = [path.join(mockSrcDir, 'components/alert.md')];
      const format = 'md';
      const stripPrefix = 'components';

      const result = getOutputFilesToClean(
        filteredFiles,
        mockSrcDir,
        mockOutDir,
        format,
        stripPrefix
      );

      expect(result).toHaveLength(1);
      // stripPrefix should remove 'components' from path
      expect(result[0]).not.toContain(path.join('components', 'components'));
    });

    it('should handle multiple files in same directory', () => {
      const filteredFiles = [
        path.join(mockSrcDir, 'components/alert.md'),
        path.join(mockSrcDir, 'components/button.md'),
        path.join(mockSrcDir, 'components/card.md')
      ];
      const format = 'md';
      const stripPrefix = 'docs';

      const result = getOutputFilesToClean(
        filteredFiles,
        mockSrcDir,
        mockOutDir,
        format,
        stripPrefix
      );

      expect(result).toHaveLength(3);
      expect(result.every(p => p.endsWith('.md'))).toBe(true);
    });
  });
});
