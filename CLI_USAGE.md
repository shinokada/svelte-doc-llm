# CLI Usage Examples

This document provides detailed examples of using svelte-doc-llm's command-line interface.

## Basic Usage

### Convert All Documentation

The default behavior processes all markdown files in your source directory:

```bash
svelte-doc-llm
```

This will:
1. Find all `.md` files in `srcDir` (from config)
2. Clean the output directory according to `cleanOutDir` setting
3. Process all files
4. Generate `llms.txt` and `context-full.txt` with all documentation

## Selective Processing

### Convert Specific Directories

Process only certain directories when you're working on specific sections:

```bash
# Single directory
svelte-doc-llm -d components

# Multiple directories
svelte-doc-llm -d components forms typography

# Nested directories
svelte-doc-llm -d components/advanced forms/inputs
```

**Use cases:**
- You updated only component documentation
- Working on a specific feature section
- Testing changes to a subset of docs

### Convert Specific Files

Process individual files for surgical updates:

```bash
# Single file
svelte-doc-llm -f components/alert.md

# Multiple files
svelte-doc-llm -f components/alert.md components/button.md forms/input.md

# With or without .md extension (both work)
svelte-doc-llm -f components/alert components/button.md
```

**Use cases:**
- Fixed a typo in one file
- Updated a single component's documentation
- Quick iteration on specific pages

### Combine Directories and Files

Mix both approaches for maximum flexibility:

```bash
# Convert entire 'typography' directory plus specific files
svelte-doc-llm -d typography -f components/alert.md forms/checkbox.md

# Convert multiple directories and multiple files
svelte-doc-llm -d components forms -f utilities/colors.md extend/theme.md
```

**Use cases:**
- Major update to one section, minor fixes elsewhere
- Reorganizing documentation structure

## Cleanup Control

### Skip Cleanup

When you want to avoid cleaning up existing output files:

```bash
# Skip cleanup entirely
svelte-doc-llm --skip-clean

# Skip cleanup with selective processing
svelte-doc-llm -d components --skip-clean
svelte-doc-llm -f components/alert.md --skip-clean
```

**Use cases:**
- Incremental builds
- You manually cleaned specific files
- Preserving other generated files in output directory

**Important:** In selective mode (using `-d` or `-f`), cleanup is already targeted to only matching files. The `--skip-clean` flag skips even this targeted cleanup.

## Practical Workflows

### Development Workflow

During active development, use selective processing for fast iteration:

```bash
# Edit components/alert.md
# Then convert just that file:
svelte-doc-llm -f components/alert.md

# Review the output in src/routes/llm/components/alert.llm.md
# Repeat as needed
```

### Feature Branch Workflow

When working on a feature that touches multiple files:

```bash
# Convert just the files you changed
svelte-doc-llm -f \
  components/new-component.md \
  components/related-component.md \
  guides/new-guide.md

# Or if you changed an entire directory
svelte-doc-llm -d components --skip-clean
```

### Pre-commit Workflow

Before committing, ensure all documentation is up-to-date:

```bash
# Full conversion
svelte-doc-llm

# Or use git to find changed markdown files
# (Advanced: would require custom script)
```

### CI/CD Workflow

In continuous integration:

```bash
# Always do a full build
svelte-doc-llm

# Or detect changed files from git diff
# and convert only those (requires custom script)
```

## Debug Mode

Enable debug output to see what's happening:

```bash
# With environment variable
DEBUG=true svelte-doc-llm -d components

# Using npm script (if defined in package.json)
npm run debug:cli -- -d components
```

Debug output shows:
- Configuration being used
- Files being processed
- Filtering decisions
- Cleanup operations

## Path Resolution

All paths in `-d` and `-f` are relative to `srcDir` in your config:

```javascript
// llm.config.js
export default {
  srcDir: './src/routes/docs',
  // ...
}
```

```bash
# These paths are relative to ./src/routes/docs
svelte-doc-llm -d components           # → ./src/routes/docs/components
svelte-doc-llm -f pages/intro.md       # → ./src/routes/docs/pages/intro.md
```

## Common Patterns

### Update Single Component

```bash
svelte-doc-llm -f components/alert.md
```

### Update Component Family

```bash
svelte-doc-llm -d components/buttons
```

### Update Multiple Sections

```bash
svelte-doc-llm -d components forms utilities
```

### Rebuild Everything

```bash
svelte-doc-llm
```

### Quick Fix Without Cleanup

```bash
svelte-doc-llm -f typo-file.md --skip-clean
```

## Output Behavior

### Full Mode (no -d or -f)
- Cleans output directory (based on `cleanOutDir` config)
- Processes all files
- Generates `llms.txt` and `context-full.txt` with all documentation

### Selective Mode (-d or -f)
- Cleans only matching output files (unless `--skip-clean`)
- Processes only matching input files
- Generates `llms.txt` and `context-full.txt` with only processed files
- Shows summary: "Processed X file(s) in selective mode"

**Important:** In selective mode, the generated `llms.txt` and `context-full.txt` will only reference the files you processed, not all documentation. This is intentional for testing/development.

## Troubleshooting

### No Files Matched

```bash
svelte-doc-llm -d nonexistent
# ⚠️ Warning: No files matched the specified directories or files
# Check that paths are relative to srcDir in your config
```

**Solution:** Verify your paths are correct relative to `srcDir`

### Wrong Directory Structure

If your output doesn't match expectations, check:
1. `srcDir` in config
2. `stripPrefix` setting in config
3. Use `DEBUG=true` to see path resolution

### Files Not Cleaning

If old output files remain:
- Check `cleanOutDir` setting in config
- In selective mode, only matching files are cleaned
- Use `--skip-clean` flag understanding

## Tips

1. **Start Specific, Go Broad**: Use `-f` for single files, `-d` for directories, no flags for everything
2. **Use Tab Completion**: Most shells support tab completion for file paths
3. **Combine With Scripts**: Create npm scripts for common operations
4. **Debug When Unsure**: Use `DEBUG=true` to understand what's happening
5. **Version Control**: Commit your `llm.config.js` for consistent team settings

## Getting Help

```bash
svelte-doc-llm --help
```

Shows all available options and examples.
