/**
 * Tools implementation for the Model Context Protocol (MCP) server.
 * 
 * This file defines the tools that can be called by the AI model through the MCP protocol.
 * Each tool has a schema that defines its parameters and a handler function that implements its logic.
 */

import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { axios } from './utils/axios.js';

// Tool definitions exported to the MCP handler
export const tools = {
  // Get component source code
  'get_component': {
    name: 'get_component',
    description: 'Get the source code for a specific shadcn/ui component',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the shadcn/ui component (e.g., "accordion", "button")',
        },
      },
      required: ['componentName'],
    },
  },
  
  // Get component demo code
  'get_component_demo': {
    name: 'get_component_demo',
    description: 'Get demo code illustrating how a shadcn/ui component should be used',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the shadcn/ui component (e.g., "accordion", "button")',
        },
      },
      required: ['componentName'],
    },
  },
};

/**
 * Validates component name from arguments
 * @param args Arguments object
 * @returns Validated component name
 * @throws McpError if validation fails
 */
function validateComponentName(args: any): string {
  if (!args?.componentName || typeof args.componentName !== "string") {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Component name is required and must be a string"
    );
  }
  return args.componentName.toLowerCase();
}

/**
 * Creates a standardized success response
 * @param data Data to include in the response
 * @returns Formatted response object
 */
function createSuccessResponse(data: any) {
  return {
    content: [
      {
        type: "text",
        text: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Implementation of the get_component tool
 * Fetches the component's source code from GitHub
 */
const getComponent = async (args: any) => {
  try {
    const componentName = validateComponentName(args);
    
    // Fetch the component from GitHub
    try {
      // Many components are directly named, like button.tsx
      const response = await axios.github.get(`/registry/new-york-v4/ui/${componentName}.tsx`);
      return createSuccessResponse(response.data);
    } catch (error) {
      // Some components might be in a directory structure like accordion/accordion.tsx
      // If the first attempt fails, try this alternative path
      try {
        const response = await axios.github.get(`/registry/new-york-v4/ui/${componentName}.tsx`);
        return createSuccessResponse(response.data);
      } catch (nestedError) {
        // If both approaches fail, check each GitHub directory
        for (const dir of axios.githubDirectories) {
          try {
            const response = await axios.github.get(`${dir}/${componentName}.tsx`);
            return createSuccessResponse(response.data);
          } catch (dirError) {
            // Continue to next directory
          }
        }
        
        // If we've tried all options and still failed, throw the original error
        throw error;
      }
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get component source code: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Implementation of the get_component_demo tool
 * Fetches the component's demo code from GitHub
 */
const getComponentDemo = async (args: any) => {
  try {
    const componentName = validateComponentName(args);
    // Fetch the component demo from GitHub
    try {
      // Try the demo file directly - many components have a demo file named like button-demo.tsx
      const response = await axios.github.get(`/components/${componentName}-demo.tsx`);
      return createSuccessResponse(response.data);
    } catch (error) {
      // If that fails, try looking in the examples directory
      try {
        const response = await axios.github.get(`/examples/${componentName}-example.tsx`);
        return createSuccessResponse(response.data);
      } catch (exampleError) {
        // As a last resort, try the special case where demos might be in a subfolder
        try {
          const response = await axios.github.get(`/components/${componentName}/${componentName}-demo.tsx`);
          return createSuccessResponse(response.data);
        } catch (nestedError) {
          // If all approaches fail, throw the original error
          throw error;
        }
      }
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get component demo code: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Map of tool names to their handler functions
 */
export const toolHandlers = {
  "get_component": getComponent,
  "get_component_demo": getComponentDemo,
};