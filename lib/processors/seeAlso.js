const DEBUG = process.env.DEBUGSEEALSO === 'true';
/**
 * Process "See also" section
 * @param {string} content - Markdown content
 * @returns {Promise<string>} - Processed content
 */
export async function processSeeAlsoSection(content) {
  // Match the relatedLinks array, even across multiple lines
  const relatedLinksMatch =
    /<script[\s\S]*?const\s+relatedLinks\s*=\s*\[([\s\S]*?)\][\s\S]*?<\/script>/i.exec(content);

  if (!relatedLinksMatch) {
    if (DEBUG) {
      console.log('No relatedLinks found in script section');
    }
    return content;
  }

  const linksStr = relatedLinksMatch[1];
  const links = linksStr
    .split(',')
    .map(link => link.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);

  if (DEBUG) {
    console.log('Found relatedLinks:', links);
  }

  let relatedLinksMarkdown = '## See also\n\n';
  for (const link of links) {
    const parts = link.split('/');
    const lastPart = parts[parts.length - 1];
    // Remove anchor from component name to match cleaned URL
    const lastPartWithoutAnchor = lastPart.replace(/#.*$/, '');
    const componentName =
      lastPartWithoutAnchor.charAt(0).toUpperCase() +
      lastPartWithoutAnchor.slice(1).replace(/-/g, ' ');
    // Remove anchor (anything after #) before adding .md extension
    const linkWithoutAnchor = link.replace(/#.*$/, '');
    const llmLink = linkWithoutAnchor.replace(/^\/docs\//, 'https://flowbite-svelte.com/llm/');
    relatedLinksMarkdown += `- [${componentName}](${llmLink}.md)\n`;
  }

  // Add final newline
  relatedLinksMarkdown += '\n';

  // Replace the entire "See also" section including any content up to the next heading or end
  // This will capture "## See also", any blank lines, and the <Seealso /> component
  const seeAlsoRegex = /^##\s+See also\s*\n+(?:.*\n)*?(?=^##\s+|$)/m;

  if (seeAlsoRegex.test(content)) {
    if (DEBUG) {
      console.log('Replacing existing "See also" section');
    }
    content = content.replace(seeAlsoRegex, relatedLinksMarkdown);
  } else {
    if (DEBUG) {
      console.log('No "See also" section found, appending');
    }
    content += `\n\n${relatedLinksMarkdown}`;
  }

  return content;
}
