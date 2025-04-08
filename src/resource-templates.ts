/**
 * Resource templates implementation for the Model Context Protocol (MCP) server.
 * 
 * This file defines resource templates that can be used to dynamically generate
 * resources based on parameters in the URI.
 */

import { z } from 'zod';
import { 
  getComponentDetails, 
  getComponentConfig, 
  getComponentExamples, 
  getDocs 
} from './utils/api.js';

/**
 * Resource template definitions exported to the MCP handler
 * Each template has a name, description, uriTemplate and contentType
 */
export const resourceTemplates = {
  'component-docs': {
    name: 'component-docs',
    description: 'Documentation for a specific shadcn/ui component',
    uriTemplate: 'resource-template:component-docs?component={component}',
    contentType: 'text/plain',
  },
  'installation-docs': {
    name: 'installation-docs',
    description: 'Installation instructions for shadcn/ui components',
    uriTemplate: 'resource-template:installation-docs?component={component}',
    contentType: 'text/plain',
  },
  'usage-docs': {
    name: 'usage-docs',
    description: 'Usage documentation for a specific shadcn/ui component',
    uriTemplate: 'resource-template:usage-docs?component={component}',
    contentType: 'text/plain',
  },
  'component-examples': {
    name: 'component-examples',
    description: 'Examples for a specific shadcn/ui component',
    uriTemplate: 'resource-template:component-examples?component={component}',
    contentType: 'text/plain',
  },
};

/**
 * Gets a resource template handler for a given URI
 * @param uri The URI of the resource template
 * @returns A function that generates the resource
 */
export const getResourceTemplate = (uri: string) => {
  // Component documentation template
  if (uri.startsWith('resource-template:component-docs')) {
    return async () => {
      const componentName = extractComponentParam(uri);
      if (!componentName) {
        return { 
          content: 'Missing component parameter', 
          contentType: 'text/plain' 
        };
      }
      
      try {
        const componentInfo = await getComponentDetails(componentName);
        
        return {
          content: `
# ${componentInfo.name.toUpperCase()}

${componentInfo.description}

## Overview
${componentInfo.name} is a UI component in the shadcn/ui library that you can use in your application.

## Source Code
Source code available at: ${componentInfo.sourceUrl}

## Installation
${componentInfo.installation || 'No installation instructions available.'}

## Usage
${componentInfo.usage || 'No usage instructions available.'}

## Props
${formatProps(componentInfo.props)}

For more examples, check the component-examples resource template.
          `,
          contentType: 'text/plain',
        };
      } catch (error) {
        return {
          content: `Error fetching component documentation: ${error instanceof Error ? error.message : String(error)}`,
          contentType: 'text/plain',
        };
      }
    };
  }
  
  // Installation documentation template
  if (uri.startsWith('resource-template:installation-docs')) {
    return async () => {
      const componentName = extractComponentParam(uri);
      if (!componentName) {
        return { 
          content: `
# General Installation for shadcn/ui

To add shadcn/ui to your project:

1. Initialize shadcn/ui in your project:
   \`\`\`bash
   npx shadcn-ui@latest init
   \`\`\`

2. Follow the prompts to configure your project.

3. Add components as needed:
   \`\`\`bash
   npx shadcn-ui@latest add [component-name]
   \`\`\`

For more detailed instructions, visit the documentation at https://ui.shadcn.com/docs/installation
          `, 
          contentType: 'text/plain' 
        };
      }
      
      try {
        const config = await getComponentConfig(componentName);
        
        return {
          content: `
# Installation for ${componentName}

${config.installation}

## Configuration
${config.config}

## Related Hooks
${formatHooks(config.hooks)}

For more details, visit https://ui.shadcn.com/docs/components/${componentName}
          `,
          contentType: 'text/plain',
        };
      } catch (error) {
        return {
          content: `Error fetching installation documentation: ${error instanceof Error ? error.message : String(error)}`,
          contentType: 'text/plain',
        };
      }
    };
  }
  
  // Usage documentation template
  if (uri.startsWith('resource-template:usage-docs')) {
    return async () => {
      const componentName = extractComponentParam(uri);
      if (!componentName) {
        return { 
          content: 'Missing component parameter', 
          contentType: 'text/plain' 
        };
      }
      
      try {
        const componentInfo = await getComponentDetails(componentName);
        
        return {
          content: `
# Usage for ${componentName}

${componentInfo.usage || 'No usage instructions available.'}

## Common Patterns

Here are common patterns for using the ${componentName} component:

${componentInfo.props ? Object.keys(componentInfo.props).map(variant => 
  `### ${variant}
  
  ${componentInfo.props?.[variant].description || ''}
  
  \`\`\`jsx
  ${componentInfo.props?.[variant].example || '// No example available'}
  \`\`\`
  `
).join('\n\n') : 'No patterns documented.'}

For more examples, check the component-examples resource template.
          `,
          contentType: 'text/plain',
        };
      } catch (error) {
        return {
          content: `Error fetching usage documentation: ${error instanceof Error ? error.message : String(error)}`,
          contentType: 'text/plain',
        };
      }
    };
  }
  
  // Component examples template
  if (uri.startsWith('resource-template:component-examples')) {
    return async () => {
      const componentName = extractComponentParam(uri);
      if (!componentName) {
        return { 
          content: 'Missing component parameter', 
          contentType: 'text/plain' 
        };
      }
      
      try {
        const examples = await getComponentExamples(componentName);
        
        return {
          content: `
# Examples for ${componentName}

${examples.length === 0 ? 'No examples available.' : examples.map(example => 
  `## ${example.title}
  
  ${example.description || ''}
  
  \`\`\`jsx
  ${example.code}
  \`\`\`
  `
).join('\n\n')}
          `,
          contentType: 'text/plain',
        };
      } catch (error) {
        return {
          content: `Error fetching component examples: ${error instanceof Error ? error.message : String(error)}`,
          contentType: 'text/plain',
        };
      }
    };
  }
  
  return undefined;
};

/**
 * Extract component parameter from URI
 * @param uri URI to extract from
 * @returns Component name or undefined
 */
function extractComponentParam(uri: string): string | undefined {
  const match = uri.match(/component=([^&]+)/);
  return match?.[1];
}

/**
 * Format props for display
 * @param props Component props
 * @returns Formatted string
 */
function formatProps(props?: Record<string, any>): string {
  if (!props || Object.keys(props).length === 0) {
    return 'No props documented.';
  }
  
  return Object.entries(props).map(([name, prop]) => {
    return `### ${name}
- Type: ${prop.type}
- Description: ${prop.description}
- Required: ${prop.required ? 'Yes' : 'No'}
${prop.default ? `- Default: ${prop.default}` : ''}
${prop.example ? `- Example: \`${prop.example}\`` : ''}`;
  }).join('\n\n');
}

/**
 * Format hooks for display
 * @param hooks List of hooks
 * @returns Formatted string
 */
function formatHooks(hooks: string[]): string {
  if (!hooks || hooks.length === 0) {
    return 'No hooks documented.';
  }
  
  return hooks.map(hook => `- ${hook}`).join('\n');
}