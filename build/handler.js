import { ListResourcesRequestSchema, ListResourceTemplatesRequestSchema, ReadResourceRequestSchema, GetPromptRequestSchema, ListPromptsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { resourceHandlers, resources } from "./resources.js";
import { promptHandlers, prompts } from "./prompts.js";
import { getResourceTemplate, resourceTemplates, } from "./resource-templates.js";
export const setupHandlers = (server) => {
    // List available resources when clients request them
    server.setRequestHandler(ListResourcesRequestSchema, () => ({ resources }));
    // Resource Templates
    server.setRequestHandler(ListResourceTemplatesRequestSchema, () => ({
        resourceTemplates,
    }));
    // Return resource content when clients request it
    server.setRequestHandler(ReadResourceRequestSchema, (request) => {
        const { uri } = request.params ?? {};
        const resourceHandler = resourceHandlers[uri];
        if (resourceHandler)
            return resourceHandler();
        const resourceTemplateHandler = getResourceTemplate(uri);
        if (resourceTemplateHandler)
            return resourceTemplateHandler();
        throw new Error("Resource not found");
    });
    server.setRequestHandler(ListPromptsRequestSchema, () => ({
        prompts: Object.values(prompts),
    }));
    server.setRequestHandler(GetPromptRequestSchema, (request) => {
        const { name, arguments: args } = request.params;
        const promptHandler = promptHandlers[name];
        if (promptHandler)
            return promptHandler(args);
        throw new Error("Prompt not found");
    });
};
