/**
 * Request handler setup for the Model Context Protocol (MCP) server.
 * 
 * This file configures how the server responds to various MCP requests by setting up
 * handlers for resources, resource templates, tools, and prompts.
 */
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import { resourceHandlers, resources } from "./resources.js";
import { promptHandlers, prompts } from "./prompts.js";
import { toolHandlers, tools } from "./tools.js";
import {
  getResourceTemplate,
  resourceTemplates,
} from "./resource-templates.js";
import { z } from "zod";

/**
 * Sets up all request handlers for the MCP server
 * @param server - The MCP server instance
 */
export const setupHandlers = (server: Server): void => {
  // List available resources when clients request them
  server.setRequestHandler(
    ListResourcesRequestSchema,
    () => ({ resources }),
  );
  
  // Resource Templates
  server.setRequestHandler(ListResourceTemplatesRequestSchema, () => ({
    resourceTemplates,
  }));

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: Object.values(tools),
  }));
  
  // Return resource content when clients request it
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params ?? {};
    
    try {
      // Check if this is a static resource
      const resourceHandler =
        resourceHandlers[uri as keyof typeof resourceHandlers];
      if (resourceHandler) return await resourceHandler();
      
      // Check if this is a generated resource from a template
      const resourceTemplateHandler = getResourceTemplate(uri);
      if (resourceTemplateHandler) return await resourceTemplateHandler();
      
      throw new McpError(ErrorCode.InvalidParams, `Resource not found: ${uri}`);
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError, 
        `Error processing resource: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  // List available prompts
  server.setRequestHandler(ListPromptsRequestSchema, () => ({
    prompts: Object.values(prompts),
  }));

  // Get specific prompt content with optional arguments
  server.setRequestHandler(GetPromptRequestSchema, (request) => {
    const { name, arguments: args } = request.params;
    const promptHandler = promptHandlers[name as keyof typeof promptHandlers];
    if (promptHandler) return promptHandler(args as { name: string, style?: string });
    throw new McpError(ErrorCode.InvalidParams, `Prompt not found: ${name}`);
  });

  // Tool request Handler - executes the requested tool with provided parameters
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: params } = request.params ?? {};
    
    if (!name || typeof name !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, "Tool name is required");
    }
    
    const handler = toolHandlers[name as keyof typeof toolHandlers];

    if (!handler) {
      throw new McpError(ErrorCode.InvalidParams, `Tool not found: ${name}`);
    }

    try {
      // Validate tool input with Zod if applicable
      const toolSchema = getToolSchema(name);
      let validatedParams = params;
      
      if (toolSchema) {
        try {
          validatedParams = toolSchema.parse(params);
        } catch (validationError) {
          if (validationError instanceof z.ZodError) {
            const errorMessages = validationError.errors.map(err => 
              `${err.path.join('.')}: ${err.message}`
            ).join(', ');
            
            throw new McpError(
              ErrorCode.InvalidParams, 
              `Invalid parameters: ${errorMessages}`
            );
          }
          throw validationError;
        }
      }
      
      // Call the handler with the validated parameters
      // This fixes the spread argument type error by using a direct function call
      return await handler(validatedParams);
    } catch (error) {
      if (error instanceof McpError) throw error;
      throw new McpError(
        ErrorCode.InternalError, 
        `Error executing tool: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
};

/**
 * Get Zod schema for tool validation if available
 * @param toolName Name of the tool
 * @returns Zod schema or undefined
 */
function getToolSchema(toolName: string): z.ZodType | undefined {
  // Import schemas dynamically based on tool name
  try {
    const schemas = require('./schemas/component.js');
    
    switch(toolName) {
      case 'get_component':
      case 'get_component_details':
        return schemas.GetComponentSchema;
        
      case 'get_examples':
        return schemas.GetExamplesSchema;
        
      case 'get_usage':
        return schemas.GetUsageSchema;
        
      case 'search_components':
        return schemas.SearchQuerySchema;
        
      case 'get_themes':
        return schemas.GetThemesSchema;
        
      case 'get_blocks':
        return schemas.GetBlocksSchema;
        
      default:
        return undefined;
    }
  } catch (error) {
    console.error("Error loading schema:", error);
    return undefined;
  }
}