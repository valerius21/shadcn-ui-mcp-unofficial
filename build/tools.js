/**
 * Tools implementation for the Model Context Protocol (MCP) server.
 *
 * This file defines the tools that can be called by the AI model through the MCP protocol.
 * Each tool has a schema that defines its parameters and a handler function that implements its logic.
 */
// Allowed values
const messageTypes = ['greeting', 'farewell', 'thank-you'];
const tones = ['formal', 'casual', 'playful'];
/**
 * Tool definitions exported to the MCP handler
 * Each tool must have a name, description, and inputSchema
 */
export const tools = {
    'create-message': {
        name: 'create-message',
        description: 'Generate a custom message with various options',
        inputSchema: {
            type: 'object',
            properties: {
                messageType: {
                    type: 'string',
                    enum: messageTypes,
                    description: 'Type of message to generate',
                },
                recipient: {
                    type: 'string',
                    description: 'Name of the person to address',
                },
                tone: {
                    type: 'string',
                    enum: tones,
                    description: 'Tone of the message',
                },
            },
            required: ['messageType', 'recipient'],
        },
    },
};
/**
 * Message template functions organized by message type and tone
 * These functions generate the actual content returned by the create-message tool
 */
const messageFns = {
    greeting: {
        formal: (recipient) => `Dear ${recipient}, I hope this message finds you well`,
        playful: (recipient) => `Hey hey ${recipient}! 🎉 What's shakin'?`,
        casual: (recipient) => `Hi ${recipient}! How are you?`,
    },
    farewell: {
        formal: (recipient) => `Best regards, ${recipient}. Until we meet again.`,
        playful: (recipient) => `Catch you later, ${recipient}! 👋 Stay awesome!`,
        casual: (recipient) => `Goodbye ${recipient}, take care!`,
    },
    "thank-you": {
        formal: (recipient) => `Dear ${recipient}, I sincerely appreciate your assistance.`,
        playful: (recipient) => `You're the absolute best, ${recipient}! 🌟 Thanks a million!`,
        casual: (recipient) => `Thanks so much, ${recipient}! Really appreciate it!`,
    },
};
/**
 * Implementation of the create-message tool
 * This function validates the input parameters and returns the appropriate message
 * @param args - The parameters for creating a message
 * @returns An object containing the generated message
 */
const createMessage = (args) => {
    if (!args.messageType)
        throw new Error("Must provide a message type.");
    if (!args.recipient)
        throw new Error("Must provide a recipient.");
    const { messageType, recipient } = args;
    const tone = args.tone || "casual";
    if (!messageTypes.includes(messageType)) {
        throw new Error(`Message type must be one of the following: ${messageTypes.join(", ")}`);
    }
    if (!tones.includes(tone)) {
        throw new Error(`If tone is provided, it must be one of the following: ${tones.join(", ")}`);
    }
    const message = messageFns[messageType][tone](recipient);
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
 * Map of tool names to their handler functions
 * This object is exported and used by the handler.ts file to call the appropriate
 * function when a tool is invoked
 */
export const toolHandlers = {
    "create-message": createMessage,
};
