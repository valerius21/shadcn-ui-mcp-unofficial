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
} from "@modelcontextprotocol/sdk/types.js";
import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import { resourceHandlers, resources } from "./resources.js";
import { promptHandlers, prompts } from "./prompts.js";
import { toolHandlers, tools } from "./tools.js";
import {
  getResourceTemplate,
  resourceTemplates,
} from "./resource-templates.js";

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
  server.setRequestHandler(ReadResourceRequestSchema, (request) => {
    const { uri } = request.params ?? {};
    // Check if this is a static resource
    const resourceHandler =
      resourceHandlers[uri as keyof typeof resourceHandlers];
    if (resourceHandler) return resourceHandler();
    
    // Check if this is a generated resource from a template
    const resourceTemplateHandler = getResourceTemplate(uri);
    if (resourceTemplateHandler) return resourceTemplateHandler();
    
    throw new Error("Resource not found");
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
    throw new Error("Prompt not found");
  });

  // Tool request Handler - executes the requested tool with provided parameters
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    type ToolHandlerKey = keyof typeof toolHandlers;
    const { name, arguments: params } = request.params ?? {};
    const handler = toolHandlers[name as ToolHandlerKey];

    if (!handler) throw new Error("Tool not found");

    type HandlerParams = Parameters<typeof handler>;
    return handler(...[params] as HandlerParams);
  });
};