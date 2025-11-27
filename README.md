# svelte-doc-llm

A Node.js tool to convert Svelte component documentation to LLM-friendly markdown format.

## Installation

```bash
pnpm i -D svelte-doc-llm
# or
npm install -g svelte-doc-llm
# or
npx svelte-doc-llm
```

## Quick Start

1. Create a `llm.config.js` file in your project root (optional)
2. Run `svelte-doc-llm` in your project directory

## CLI Options

```bash
# Convert all documentation (default)
svelte-doc-llm

# Convert only specific directories
svelte-doc-llm -d components forms

# Convert only specific files
svelte-doc-llm -f components/alert.md forms/input.md

# Mix directories and files
svelte-doc-llm -d typography -f components/alert.md

# Skip cleanup phase (useful for incremental updates)
svelte-doc-llm -d components --skip-clean

# Show help
svelte-doc-llm --help
```

### Command Line Arguments

- `-d, --directories <dir1> <dir2> ...` - Convert only specified directories (relative to srcDir)
- `-f, --files <file1> <file2> ...` - Convert only specified files (relative to srcDir)
- `--skip-clean` - Skip the cleanup phase, only convert specified files/directories
- `-h, --help` - Show help message

## Configuration

Configuration can be provided in a `llm.config.js` file:

```javascript
export default {
  srcDir: './src/routes/docs', // Input directory with markdown files
  outDir: './src/routes/llm', // Output directory for processed files
  format: 'md', // Output format
  dataDir: './src/routes/component-data', // Directory with component JSON data
  ignore: [], // Sections to remove (by heading)
  stripPrefix: 'docs',
  cleanOutDir: true, // Whether to completely clean the output directory
  ignoreDirs: [], // Directory names to preserve at any nesting level (e.g., ['[...slug]'])
  // Required fields - must be provided in llm.config.js
  baseUrl: null,
  repo: null,
  pkgName: null,
  // Optional fields
  contextOrder: ['pages', 'components', 'forms', 'typography', 'extend', 'utilities'],
  docsDir: 'src/routes',
  examplesDir: 'src/routes/docs-examples'
};
```

Default values will be used if no config file is found:

## Features

- **Selective Processing**: Convert only specific directories or files for faster iteration
- **Frontmatter Processing**: Extracts title metadata
- **Code Block Formatting**: Normalizes Svelte code block syntax
- **Content Filtering**: Removes specified sections
- **Component Data Integration**: Imports and formats component definitions from JSON
- **Script Tag Removal**: Cleans up script sections
- **Related Links Formatting**: Processes "See also" sections into standardized links
- **Flexible Cleanup**: Full, selective, or skip cleanup entirely

## Use Cases

- Preparing documentation for consumption by AI assistants
- Converting component libraries to LLM-compatible formats
- Creating self-contained reference materials for language models
- Following the [llmstxt.org](https://llmstxt.org/) standard for LLM-friendly content

## License

MIT

## Note for publishing a package

```bash
pnpm ch
pnpm cv
git add .
git commit -m "v0.5.1"
git push
pnpm changeset publish
git push --tags
```
