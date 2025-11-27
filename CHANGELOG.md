# svelte-doc-llm

## 0.8.0

### Minor Changes

- **feat: Add CLI options for selective processing** - Major new feature adding command-line arguments for targeted documentation conversion
  
  New CLI options:
  - `-d, --directories <dir1> <dir2> ...` - Convert only specified directories
  - `-f, --files <file1> <file2> ...` - Convert only specified files  
  - `--skip-clean` - Skip cleanup phase for incremental updates
  - `-h, --help` - Display help message
  
  Benefits:
  - Faster iteration during development (convert only what you're working on)
  - Selective rebuilds in CI/CD pipelines
  - Better control over cleanup behavior
  - Mix and match directories and files in a single command
  
  Examples:
  ```bash
  # Convert only components directory
  svelte-doc-llm -d components
  
  # Convert specific files
  svelte-doc-llm -f components/alert.md forms/input.md
  
  # Mix both approaches
  svelte-doc-llm -d typography -f components/alert.md
  
  # Skip cleanup for incremental updates
  svelte-doc-llm -d components --skip-clean
  ```
  
  In selective mode, `llms.txt` and `context-full.txt` are regenerated with only the processed files, and cleanup is targeted to only matching output files.

## 0.7.0

### Minor Changes

- 8ea15eb: Add `ignoreDirs` configuration option to preserve specific directories during output directory cleaning. This is useful for preserving dynamic routes like `[...slug]` or other custom directories that should not be removed when `cleanOutDir` is enabled.

  The `ignoreDirs` option works at any nesting level within the output directory. Parent directories containing ignored subdirectories are automatically preserved.

  Also fixes the default `outDir` path from `./static/llm` to `./src/routes/llm` to match SvelteKit routing conventions.

  Usage:

  ```javascript
  export default {
    // ... other config
    cleanOutDir: true,
    ignoreDirs: ['[...slug]', 'custom-dir']
  };
  ```

- feat: ignoreDirs

## 0.6.1

### Patch Changes

- fix: remove hash fragments from seeAlso links
