/**
 * Process code blocks - modify svelte example tags
 * @param {string} content - Markdown content
 * @returns {string} Processed content
 */
export function processCodeBlocks(content) {
  return content.replace(/^```svelte.*$/gm, '```svelte');
}

/**
 * Remove script section from markdown
 * @param {string} content - Markdown content
 * @returns {string} Processed content
 */
export function removeScriptSection(content) {
  // Remove script sections with optional attributes (lang, type, etc.)
  return content.replace(/<script[^>]*>[\s\S]*?<\/script>\s*/, '');
}
