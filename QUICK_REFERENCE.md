# svelte-doc-llm CLI Quick Reference

## Basic Commands

```bash
# Convert all documentation
svelte-doc-llm

# Show help
svelte-doc-llm --help
```

## Selective Processing

```bash
# Convert one directory
svelte-doc-llm -d components

# Convert multiple directories
svelte-doc-llm -d components forms typography

# Convert one file
svelte-doc-llm -f components/alert.md

# Convert multiple files
svelte-doc-llm -f components/alert.md forms/input.md

# Mix directories and files
svelte-doc-llm -d typography -f components/alert.md
```

## Cleanup Control

```bash
# Skip cleanup entirely
svelte-doc-llm --skip-clean

# Selective processing without cleanup
svelte-doc-llm -d components --skip-clean
```

## Flags Reference

| Flag | Long Form | Arguments | Description |
|------|-----------|-----------|-------------|
| `-d` | `--directories` | `<dir1> <dir2> ...` | Convert only specified directories |
| `-f` | `--files` | `<file1> <file2> ...` | Convert only specified files |
| | `--skip-clean` | none | Skip the cleanup phase |
| `-h` | `--help` | none | Show help message |

## Path Rules

✅ All paths are relative to `srcDir` in config
✅ Files can be specified with or without `.md` extension
✅ Use forward slashes (`/`) or backslashes (`\`)
✅ Supports nested directories

## Behavior by Mode

| Mode | Cleanup | Processing | Output Files |
|------|---------|------------|--------------|
| **Full** (no flags) | Based on `cleanOutDir` config | All files | All files |
| **Selective** (`-d` or `-f`) | Only matching files | Only matching files | Only matching files |
| **Skip-clean** (`--skip-clean`) | None | Specified files | Specified files |

## Common Use Cases

```bash
# Quick fix to one file
svelte-doc-llm -f components/alert.md

# Update component section
svelte-doc-llm -d components

# Update multiple sections
svelte-doc-llm -d components forms utilities

# Incremental build
svelte-doc-llm -d components --skip-clean

# Full rebuild (default)
svelte-doc-llm
```

## npm Scripts

```bash
# Using package.json scripts
npm run llm                     # Convert all
npm run llm:dir -- components   # Convert directory
npm run llm:file -- alert.md    # Convert file
npm run debug:cli -- -d comp    # Debug mode
```

## Debug Mode

```bash
# Enable debug output
DEBUG=true svelte-doc-llm -d components

# Or use the debug script
npm run debug:cli -- -d components
```

## Examples

```bash
# Scenario: You updated Alert component docs
svelte-doc-llm -f components/alert.md

# Scenario: Working on forms section
svelte-doc-llm -d forms

# Scenario: Fixed typos in multiple files
svelte-doc-llm -f \
  components/alert.md \
  components/button.md \
  forms/input.md

# Scenario: Major update to components + one guide fix
svelte-doc-llm -d components -f guides/getting-started.md

# Scenario: Quick test without cleaning
svelte-doc-llm -f test.md --skip-clean

# Scenario: Pre-commit full check
svelte-doc-llm
```

## Troubleshooting

**No files matched?**
- Check paths are relative to `srcDir` in config
- Use `DEBUG=true` to see what's happening

**Files not cleaning?**
- In selective mode, only matching files clean
- Use `--skip-clean` to skip cleanup
- Check `cleanOutDir` in config for full mode

**Need help?**
```bash
svelte-doc-llm --help
```

## More Info

- Full guide: `CLI_USAGE.md`
- Technical details: `IMPLEMENTATION.md`
- Configuration: `README.md`
