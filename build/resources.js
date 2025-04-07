/**
 * Resources implementation for the Model Context Protocol (MCP) server.
 *
 * This file defines static resources that can be accessed by the AI model.
 * Resources provide contextual information or data that the model can use.
 */
/**
 * List of resources metadata available in this MCP server
 * Each resource must have a uri, name, description, and mimeType
 */
export const resources = [
    {
        uri: "hello://world",
        name: "Hello World Message",
        description: "A simple greeting message",
        mimeType: "text/plain",
    },
];
/**
 * Map of resource URIs to their handler functions
 * Each handler returns the actual content of the resource when requested
 */
export const resourceHandlers = {
    "hello://world": () => ({
        contents: [
            {
                uri: "hello://world",
                text: "Hello, World! This is my first MCP resource.",
            },
        ],
    }),
};
