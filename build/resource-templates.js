/**
 * Resource Templates implementation for the Model Context Protocol (MCP) server.
 *
 * This file defines resource templates that allow for dynamic creation of resources.
 * Resource templates enable the server to generate resources based on URI patterns and parameters.
 */
/**
 * List of resource templates metadata available in this MCP server
 * Each template must have a uriTemplate, name, description, and mimeType
 */
export const resourceTemplates = [
    {
        uriTemplate: "greetings://{name}",
        name: "Personal Greeting",
        description: "A personalized greeting message",
        mimeType: "text/plain",
    },
];
/**
 * Regular expression to match the greetings URI pattern
 */
const greetingExp = /^greetings:\/\/(.+)$/;
/**
 * Handler function for the greetings resource template
 * Creates a personalized greeting message based on the name parameter in the URI
 * @param uri - The complete URI being requested
 * @param matchText - The RegExp match result containing captured groups
 * @returns A function that generates the resource content
 */
const greetingMatchHandler = (uri, matchText) => () => {
    const name = decodeURIComponent(matchText[1]);
    return {
        contents: [
            {
                uri,
                text: `Hello, ${name}! Welcome to MCP.`,
            },
        ],
    };
};
/**
 * Function to find and return the appropriate resource template handler for a URI
 * @param uri - The URI to match against available templates
 * @returns The handler function for the matched template or undefined if no match
 */
export const getResourceTemplate = (uri) => {
    const greetingMatch = uri.match(greetingExp);
    if (greetingMatch)
        return greetingMatchHandler(uri, greetingMatch);
};
