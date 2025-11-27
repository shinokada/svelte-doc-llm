/**
 * CLI argument parser for svelte-doc-llm
 */

const DEBUG = process.env.DEBUG === 'true';

/**
 * Parse command line arguments
 * @returns {Object} Parsed options
 */
export function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    directories: [],
    files: [],
    skipClean: false,
    help: false
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    switch (arg) {
      case '-d':
      case '--directories':
        // Collect all following arguments until we hit another flag or end
        i++;
        while (i < args.length && !args[i].startsWith('-')) {
          options.directories.push(args[i]);
          i++;
        }
        continue; // Don't increment i again

      case '-f':
      case '--files':
        // Collect all following arguments until we hit another flag or end
        i++;
        while (i < args.length && !args[i].startsWith('-')) {
          options.files.push(args[i]);
          i++;
        }
        continue; // Don't increment i again

      case '--skip-clean':
        options.skipClean = true;
        break;

      case '-h':
      case '--help':
        options.help = true;
        break;

      default:
        if (arg.startsWith('-')) {
          console.warn(`Warning: Unknown option '${arg}' ignored`);
        }
    }
    i++;
  }

  if (DEBUG) {
    console.log('Parsed CLI options:', JSON.stringify(options, null, 2));
  }

  return options;
}

/**
 * Display help message
 */
export function showHelp() {
  console.log(`
svelte-doc-llm - Convert Svelte documentation to LLM-friendly format

USAGE:
  svelte-doc-llm [options]

OPTIONS:
  -d, --directories <dir1> <dir2> ...
      Convert only the specified directories (relative to srcDir in config)
      Example: svelte-doc-llm -d components forms

  -f, --files <file1> <file2> ...
      Convert only the specified files (relative to srcDir in config)
      Example: svelte-doc-llm -f components/alert.md forms/input.md

  --skip-clean
      Skip the cleanup phase, only convert specified files/directories

  -h, --help
      Show this help message

EXAMPLES:
  # Convert all documentation (default behavior)
  svelte-doc-llm

  # Convert only the components and forms directories
  svelte-doc-llm -d components forms

  # Convert specific files
  svelte-doc-llm -f components/alert.md components/button.md

  # Mix directories and files
  svelte-doc-llm -d typography -f components/alert.md

  # Convert without cleaning output directory
  svelte-doc-llm -d components --skip-clean

CONFIGURATION:
  Create a llm.config.js file in your project root to customize settings.
  See documentation for available options.
`);
}

/**
 * Validate CLI options
 * @param {Object} options - Parsed options
 * @returns {boolean} True if valid, false otherwise
 */
export function validateOptions(options) {
  if (options.directories.length === 0 && options.files.length === 0) {
    // No specific targets specified, will process all files
    return true;
  }

  // Validate that paths don't contain invalid characters
  const invalidChars = /[<>"|?*]/;

  for (const dir of options.directories) {
    if (invalidChars.test(dir)) {
      console.error(`Error: Directory path contains invalid characters: ${dir}`);
      return false;
    }
  }

  for (const file of options.files) {
    if (invalidChars.test(file)) {
      console.error(`Error: File path contains invalid characters: ${file}`);
      return false;
    }
  }

  return true;
}
