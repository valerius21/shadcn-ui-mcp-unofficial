/**
 * Prompts implementation for the Model Context Protocol (MCP) server.
 *
 * This file defines prompts that guide the AI model's responses.
 * Prompts help to direct the model on how to process user requests.
 */
/**
 * List of prompts metadata available in this MCP server
 * Each prompt must have a name, description, and arguments if parameters are needed
 */
export const prompts = {
    "create-greeting": {
        name: "create-greeting",
        description: "Generate a customized greeting message",
        arguments: [
            {
                name: "name",
                description: "Name of the person to greet",
                required: true,
            },
            {
                name: "style",
                description: "The style of greeting, such a formal, excited, or casual. If not specified casual will be used"
            }
        ],
    },
};
/**
 * Map of prompt names to their handler functions
 * Each handler generates the actual prompt content with the provided parameters
 * @param name - The name of the person to greet
 * @param style - The style of greeting (defaults to "casual")
 * @returns An object containing the prompt message
 */
export const promptHandlers = {
    "create-greeting": ({ name, style = "casual" }) => {
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: `Please generate a greeting in ${style} style to ${name}.`,
                    },
                },
            ],
        };
    },
};
