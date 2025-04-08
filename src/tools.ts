/**
 * Tools implementation for the Model Context Protocol (MCP) server.
 * 
 * This file defines the tools that can be called by the AI model through the MCP protocol.
 * Each tool has a schema that defines its parameters and a handler function that implements its logic.
 */

import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import {
  getComponentDemo,
  listComponents,
  getComponentDetails,
  getComponentExamples,
  searchComponents,
  getComponentUsage,
  getThemes,
  getBlocks,
  getBlockDetails,
  getComponentConfig
} from './utils/api.js';

import { 
  GetComponentSchema,
  GetExamplesSchema,
  GetUsageSchema,
  SearchQuerySchema,
  GetThemesSchema,
  GetBlocksSchema
} from './schemas/component.js';

// Tool definitions exported to the MCP handler
export const tools = {
  // Basic message tool (kept from original)
  'create-message': {
    name: 'create-message',
    description: 'Generate a custom message with various options',
    inputSchema: {
      type: 'object',
      properties: {
        messageType: {
          type: 'string',
          enum: ['greeting', 'farewell', 'thank-you'],
          description: 'Type of message to generate',
        },
        recipient: {
          type: 'string',
          description: 'Name of the person to address',
        },
        tone: {
          type: 'string',
          enum: ['formal', 'casual', 'playful'],
          description: 'Tone of the message',
        },
      },
      required: ['messageType', 'recipient'],
    },
  },
  
  // ShadcnUI Component Tools
  'list_shadcn_components': {
    name: 'list_shadcn_components',
    description: 'Get a list of all available shadcn/ui components',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  
  'get_component': {
    name: 'get_component',
    description: 'Get detailed information about a specific shadcn/ui component including its hooks and configuration',
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
  
  'get_component_details': {
    name: 'get_component_details',
    description: 'Get detailed information about a specific shadcn/ui component',
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
  
  'get_examples': {
    name: 'get_examples',
    description: 'Get usage examples for a specific shadcn/ui component',
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
  
  'get_usage': {
    name: 'get_usage',
    description: 'Get usage instructions for a specific shadcn/ui component',
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
  
  'search_components': {
    name: 'search_components',
    description: 'Search for shadcn/ui components by keyword',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query to find relevant components',
        },
      },
      required: ['query'],
    },
  },
  
  'get_themes': {
    name: 'get_themes',
    description: 'Get available themes for shadcn/ui',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional search query to filter themes',
        },
      },
      required: [],
    },
  },
  
  'get_blocks': {
    name: 'get_blocks',
    description: 'Get reusable UI blocks/patterns from shadcn/ui',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional search query to filter blocks',
        },
        category: {
          type: 'string',
          description: 'Category of blocks to filter by',
        },
      },
      required: [],
    },
  },
};

/**
 * Message template functions (kept from original)
 */
const messageFns = {
  greeting: {
    formal: (recipient: string) =>
      `Dear ${recipient}, I hope this message finds you well`,
    playful: (recipient: string) => `Hey hey ${recipient}! 🎉 What's shakin'?`,
    casual: (recipient: string) => `Hi ${recipient}! How are you?`,
  },
  farewell: {
    formal: (recipient: string) =>
      `Best regards, ${recipient}. Until we meet again.`,
    playful: (recipient: string) =>
      `Catch you later, ${recipient}! 👋 Stay awesome!`,
    casual: (recipient: string) => `Goodbye ${recipient}, take care!`,
  },
  "thank-you": {
    formal: (recipient: string) =>
      `Dear ${recipient}, I sincerely appreciate your assistance.`,
    playful: (recipient: string) =>
      `You're the absolute best, ${recipient}! 🌟 Thanks a million!`,
    casual: (recipient: string) =>
      `Thanks so much, ${recipient}! Really appreciate it!`,
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
 * Validates search query from arguments
 * @param args Arguments object
 * @returns Validated search query
 * @throws McpError if validation fails
 */
function validateSearchQuery(args: any): string {
  if (!args?.query || typeof args.query !== "string") {
    throw new McpError(
      ErrorCode.InvalidParams,
      "Search query is required and must be a string"
    );
  }
  return args.query.toLowerCase();
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
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Implementation of the create-message tool (kept from original)
 */
const createMessage = (args: any) => {
  const { messageType, recipient, tone = 'casual' } = args;
  const message = messageFns[messageType as keyof typeof messageFns][tone as 'formal' | 'casual' | 'playful'](recipient);
  
  return {
    content: [
      {
        type: "text",
        text: message,
      },
    ],
  };
};

/**
 * Implementation of the list_shadcn_components tool
 */
const listShadcnComponents = async () => {
  try {
    const components = await listComponents();
    return createSuccessResponse(components);
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to fetch shadcn/ui components: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Implementation of the get_component tool
 */
const getComponent = async (args: any) => {
  try {
    const componentName = validateComponentName(args);
    const componentConfig = await getComponentConfig(componentName);
    
    return createSuccessResponse({
      ...componentConfig,
      name: componentName
    });
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get component: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Implementation of the get_component_details tool
 */
const getComponentDetailsHandler = async (args: any) => {
  try {
    const componentName = validateComponentName(args);
    const componentInfo = await getComponentDetails(componentName);
    
    return createSuccessResponse(componentInfo);
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get component details: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Implementation of the get_examples tool
 */
const getExamplesHandler = async (args: any) => {
  try {
    const componentName = validateComponentName(args);
    const examples = await getComponentExamples(componentName);
    
    return createSuccessResponse(examples);
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get component examples: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Implementation of the get_usage tool
 */
const getUsageHandler = async (args: any) => {
  try {
    const componentName = validateComponentName(args);
    const usage = await getComponentUsage(componentName);
    
    return createSuccessResponse({
      componentName,
      usage
    });
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get component usage: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Implementation of the search_components tool
 */
const searchComponentsHandler = async (args: any) => {
  try {
    const query = validateSearchQuery(args);
    const results = await searchComponents(query);
    
    return createSuccessResponse(results);
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to search components: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Implementation of the get_themes tool
 */
const getThemesHandler = async (args: any) => {
  try {
    const query = args?.query;
    const themes = await getThemes(query);
    
    return createSuccessResponse(themes);
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get themes: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Implementation of the get_blocks tool
 */
const getBlocksHandler = async (args: any) => {
  try {
    const query = args?.query;
    const category = args?.category;
    const blocks = await getBlocks(query, category);
    
    return createSuccessResponse(blocks);
  } catch (error) {
    throw new McpError(
      ErrorCode.InternalError,
      `Failed to get blocks: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Map of tool names to their handler functions
 */
export const toolHandlers = {
  "create-message": createMessage,
  "list_shadcn_components": listShadcnComponents,
  "get_component": getComponent,
  "get_component_details": getComponentDetailsHandler,
  "get_examples": getExamplesHandler,
  "get_usage": getUsageHandler,
  "search_components": searchComponentsHandler,
  "get_themes": getThemesHandler,
  "get_blocks": getBlocksHandler,
};