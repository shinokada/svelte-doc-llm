import { describe, it, expect } from 'vitest';
import { processCodeBlocks } from '../../lib/processors/codeBlocks.js';
import { removeSections } from '../../lib/processors/sections.js';

describe('output snapshots', () => {
  it('should match processed code block snapshot', () => {
    const input = `
\`\`\`svelte example hideScript
<script>
  let count = 0;
</script>

<button on:click={() => count++}>
  Count: {count}
</button>
\`\`\`
`;
    expect(processCodeBlocks(input)).toMatchSnapshot();
  });

  it('should match section removal snapshot', () => {
    const input = `
# Main Title

## Introduction
Some intro text

## Installation
npm install package

## Usage
How to use

## API
API documentation
`;
    const result = removeSections(input, ['Installation']);
    expect(result).toMatchSnapshot();
  });
});