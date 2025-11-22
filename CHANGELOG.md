# svelte-doc-llm

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

## 0.6.0

### Minor Changes

- fix: seealso and add debug scripts

## 0.5.1

### Patch Changes

- fix: publish problem

## 0.3.0

### Minor Changes

- feat: add two exported converter functions (generateLlmsTxt, generateContextFull), a new include-files preprocessor to inline example snippets, stricter config validation with required fields, processFiles now returns file descriptors, processor regex improvements, and extensive Vitest test infra and tests.

## 0.2.2

### Patch Changes

- docs: README update

## 0.2.1

### Patch Changes

- fix: lower node engines

## 0.2.0

### Minor Changes

- feat: add cleanOutDir option/config

## 0.1.2

### Patch Changes

- fix: outDir to static

## 0.1.1

### Patch Changes

- fix: update .gitignore
