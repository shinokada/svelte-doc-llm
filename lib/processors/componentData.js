import { loadComponentData } from '../fileSystem.js';
const DEBUG = process.env.DEBUGCOMPONENT === 'true';
/**
 * Process "Component data" section
 * @param {string} content - The content to process
 * @param {string} componentTitle - The title of the component
 * @param {string} dataDir - Directory path for component data
 * @returns {Promise<string>} - The processed content
 */
export async function processComponentDataSection(content, componentTitle, dataDir) {
  if (!componentTitle || !content.includes('## Component data')) {
    return content;
  }

  // Extract component data section - using a more precise regex to capture the section
  const componentDataMatch = /## Component data\s*\n([\s\S]*?)(?=\n##|$)/.exec(content);

  if (!componentDataMatch) {
    return content;
  }

  const componentDataSection = componentDataMatch[0];

  // Try to load component data from JSON files
  try {
    // Create formatted directory name
    const componentDirName = componentTitle.toLowerCase().replace(/\s+/g, '-');

    // Load component data
    const componentsData = await loadComponentData(componentTitle, componentDirName, dataDir);

    if (!componentsData.length) {
      if (DEBUG) {
        console.warn(`No component data found for ${componentTitle}`);
      }
      return content;
    }

    // Create markdown for component data
    let newComponentDataSection = '## Component data\n\n';

    for (const componentData of componentsData) {
      newComponentDataSection += `### ${componentData.name}\n\n`;

      // Add type info
      if (componentData.type) {
        newComponentDataSection += '#### Types\n\n';
        newComponentDataSection += `[${componentData.type.name}](${componentData.type.link})\n\n`;
      }

      // Add props
      if (componentData.props && componentData.props.length) {
        newComponentDataSection += '#### Props\n\n';

        for (const [prop, defaultValue] of componentData.props) {
          const defaultText = defaultValue !== '' ? `: ${defaultValue}` : '';
          newComponentDataSection += `- ${prop}${defaultText}\n`;
        }

        newComponentDataSection += '\n';
      }
    }

    // Log for debugging
    if (DEBUG) {
      console.log(`Replacing Component data section for ${componentTitle}`);
    }
    if (DEBUG) {
      console.log(`Old section length: ${componentDataSection.length}`);
    }
    if (DEBUG) {
      console.log(`New section length: ${newComponentDataSection.length}`);
    }

    // Replace original component data section
    const updatedContent = content.replace(componentDataSection, newComponentDataSection);

    // Verify replacement was successful
    if (content === updatedContent) {
      console.warn(`Warning: Component data section replacement failed for ${componentTitle}`);

      // Debug: Log the regex match details
      if (DEBUG) {
        console.log('Component data section regex match:');
      }
      if (DEBUG) {
        console.log('Match found:', !!componentDataMatch);
      }
      if (componentDataMatch && DEBUG) {
        console.log('Match index:', componentDataMatch.index);
        console.log('Match[0] length:', componentDataMatch[0].length);
        console.log('First 50 chars of matched section:', componentDataMatch[0].substring(0, 50));
      }
    }

    return updatedContent;
  } catch (error) {
    console.error(`Error processing component data for ${componentTitle}:`, error.message);
    console.error(error.stack);
    return content;
  }
}
