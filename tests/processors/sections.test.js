import { describe, it, expect } from 'vitest';
import { removeSections } from '../../lib/processors/sections.js';

describe('removeSections', () => {
  it('should remove specified section', () => {
    const input = `# Title\n\nContent\n\n## Installation\n\nInstall steps\n\n## Usage\n\nUsage info`;
    const result = removeSections(input, ['Installation']);
    expect(result).not.toContain('## Installation');
    expect(result).not.toContain('Install steps');
    expect(result).toContain('## Usage');
  });

  it('should handle multiple sections to remove', () => {
    const input = `# Title\n\n## Setup\n\nSetup info\n\n## Installation\n\nInstall info\n\n## Usage\n\nUsage`;
    const result = removeSections(input, ['Setup', 'Installation']);
    expect(result).not.toContain('Setup');
    expect(result).not.toContain('Installation');
    expect(result).toContain('Usage');
  });

  it('should handle nested sections correctly', () => {
    const input = `## Parent\n\n### Child\n\nChild content\n\n## Next Section\n\nContent`;
    const result = removeSections(input, ['Parent']);
    expect(result).not.toContain('### Child');
    expect(result).toContain('## Next Section');
  });

  it('should return original content if no sections match', () => {
    const input = '## Existing\n\nContent';
    expect(removeSections(input, ['NonExistent'])).toBe(input);
  });

  it('should handle empty ignore list', () => {
    const input = '## Section\n\nContent';
    expect(removeSections(input, [])).toBe(input);
  });
});
