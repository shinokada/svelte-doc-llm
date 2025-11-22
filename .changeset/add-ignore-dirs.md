---
"svelte-doc-llm": minor
---

Add `ignoreDirs` configuration option to preserve specific directories during output directory cleaning. This is useful for preserving dynamic routes like `[...slug]` or other custom directories that should not be removed when `cleanOutDir` is enabled.

Also fixes the default `outDir` path from `./static/llm` to `./src/routes/llm` to match SvelteKit routing conventions.

Usage:
```javascript
export default {
  // ... other config
  cleanOutDir: true,
  ignoreDirs: ["[...slug]", "custom-dir"],
};
```
