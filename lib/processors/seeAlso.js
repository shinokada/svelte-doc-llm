/**
 * Process "See also" section
 * @param {string} content - Markdown content
 * @returns {Promise<string>} - Processed content
 */
export async function processSeeAlsoSection(content) {
  // Match the relatedLinks array, even across multiple lines
  const relatedLinksMatch = /<script>[\s\S]*?const\s+relatedLinks\s*=\s*\[([\s\S]*?)\][\s\S]*?<\/script>/i.exec(content);
  
  if (!relatedLinksMatch) return content;
  
  const linksStr = relatedLinksMatch[1];
  const links = linksStr
    .split(',')
    .map(link => link.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
  
  let relatedLinksMarkdown = '## See also\n\n';
  for (const link of links) {
    const parts = link.split('/');
    const lastPart = parts[parts.length - 1];
    const componentName = lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace(/-/g, ' ');
    const llmLink = link.replace(/^\/docs\//, 'https://flowbite-svelte.com/llm/');
    relatedLinksMarkdown += `- [${componentName}](${llmLink}.md)\n`;
  }

  // Add final newline to ensure a trailing line
  relatedLinksMarkdown += '\n';

  if (/## See also[\s\S]*?(?=^##|\Z)/m.test(content)) {
    content = content.replace(/## See also[\s\S]*?(?=^##|\Z)/m, relatedLinksMarkdown);
  } else {
    content += `\n\n${relatedLinksMarkdown}`;
  }

  return content;
}