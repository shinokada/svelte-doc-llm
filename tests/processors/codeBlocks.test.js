import { describe, it, expect } from 'vitest';
import { processCodeBlocks, removeScriptSection } from '../../lib/processors/codeBlocks.js';

describe('processCodeBlocks', () => {
  it.each([
    ['```svelte example hideScript\nx\n```', '```svelte\nx\n```'],
    ['```svelte\tfoo\nx\n```', '```svelte\nx\n```'],
    ['```svelte   \nx\n```', '```svelte\nx\n```'],
  ])('normalizes svelte fences (%#)', (input, expected) => {
    expect(processCodeBlocks(input)).toBe(expected);
  });

  it('should handle multiple code blocks', () => {
    const input = `
\`\`\`svelte example
code 1
\`\`\`

\`\`\`svelte hideScript
code 2
\`\`\`
`;
    expect(processCodeBlocks(input)).toContain('```svelte\ncode 1');
    expect(processCodeBlocks(input)).toContain('```svelte\ncode 2');
  });

  it('should not modify non-svelte code blocks', () => {
    const input = '```javascript\ncode\n```';
    expect(processCodeBlocks(input)).toBe(input);
  });

  it('should handle empty content', () => {
    expect(processCodeBlocks('')).toBe('');
  });
});

describe('removeScriptSection', () => {
  it('should remove script tags with lang attribute', () => {
    const input = '<script lang="ts">\nconst x = 1;\n</script>\n\nContent here';
    const expected = 'Content here';  // Changed: no leading newline
    expect(removeScriptSection(input)).toBe(expected);
  });

  it('should remove script tags without attributes', () => {
    const input = '<script>\nconst x = 1;\n</script>\n\nContent';
    const expected = 'Content';  // Changed: no leading newline
    expect(removeScriptSection(input)).toBe(expected);
  });

  it('should handle content without script tags', () => {
    const input = 'Just some content';
    expect(removeScriptSection(input)).toBe(input);
  });

  it('should only remove the first script section', () => {
    const input = '<script>code1</script>\nContent\n<script>code2</script>';
    const result = removeScriptSection(input);
    expect(result).not.toContain('code1');
    // Changed: only removes FIRST script section, second remains
    expect(result).toContain('code2');
    expect(result).toContain('Content');
  });
});