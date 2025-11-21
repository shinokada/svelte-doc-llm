/**
 * Remove sections by title
 * @param {string} content - Markdown content
 * @param {Array<string>} ignoreList - List of section titles to remove
 * @returns {string} - Processed content
 */
export function removeSections(content, ignoreList) {
  if (!ignoreList.length) {
    return content;
  }

  const lines = content.split('\n');
  const processedLines = [];

  let insideIgnoredSection = false;
  let currentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is a heading
    const headingMatch = line.match(/^(#+)\s+(.+)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2];

      // If we're ignoring a section and found a heading of same or higher level, stop ignoring
      if (insideIgnoredSection && level <= currentLevel) {
        insideIgnoredSection = false;
      }

      // Check if heading should be ignored
      if (ignoreList.includes(title) || ignoreList.includes(`${'#'.repeat(level)} ${title}`)) {
        insideIgnoredSection = true;
        currentLevel = level;
        continue;
      }
    }

    if (!insideIgnoredSection) {
      processedLines.push(line);
    }
  }

  return processedLines.join('\n');
}
