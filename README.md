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

## Configuration

Configuration can be provided in a `llm.config.js` file:

```javascript
export default {
  srcDir: "./src/routes/docs",   // Input directory with markdown files
  outDir: "./static/llm",        // Output directory for processed files
  ignore: ["## References"],     // Sections to remove (by heading)
  format: "md",                  // Output format
  dataDir: "./src/routes/component-data"  // Directory with component JSON data
  cleanOutDir: true    // Whether to completely clean the output directory
}
```

Default values will be used if no config file is found:
- srcDir: "./src/routes/docs"
- outDir: "./static/llm"
- format: "md"
- dataDir: "./src/routes/component-data"
- ignore: [] (empty array)
- cleanOutDir: true

## Features

- **Frontmatter Processing**: Extracts title metadata
- **Code Block Formatting**: Normalizes Svelte code block syntax
- **Content Filtering**: Removes specified sections
- **Component Data Integration**: Imports and formats component definitions from JSON
- **Script Tag Removal**: Cleans up script sections
- **Related Links Formatting**: Processes "See also" sections into standardized links

## Use Cases

- Preparing documentation for consumption by AI assistants
- Converting component libraries to LLM-compatible formats
- Creating self-contained reference materials for language models
- Following the [llmstxt.org](https://llmstxt.org/) standard for LLM-friendly content

## License

MIT