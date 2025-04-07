# Model Context Protocol (MCP) Server

A TypeScript implementation of a Model Context Protocol server that facilitates communication between AI models and external tools, resources, and prompts.

## Project Structure

```
mcp-v2/
├── build/             # Compiled JavaScript files (git-ignored)
├── src/               # TypeScript source files
│   ├── index.ts       # Server entry point
│   ├── handler.ts     # Request handlers implementation
│   ├── tools.ts       # Tool definitions
│   ├── resources.ts   # Resource definitions
│   ├── resource-templates.ts # Resource template definitions
│   └── prompts.ts     # Prompt definitions
├── node_modules/      # Dependencies (git-ignored)
├── package.json       # Project dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── startup.sh         # Script to clean, build, and start the server
```

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Installation

```bash
npm install
```

### Running the Server

Use the startup script to clean, build, and start the server:

```bash
bash startup.sh
```

Or run the individual commands:

```bash
npm run clean
npm run build
npm run start # starts MCP inspector on default port
```

## Server Implementation

The server uses the Model Context Protocol (MCP) SDK to handle various types of requests. The main setup happens in `handler.ts` through the `setupHandlers` function which configures how the server responds to different request types.

### Request Handlers

The server uses `setRequestHandler` to handle different request types:

```typescript
server.setRequestHandler(RequestSchema, handlerFunction);
```

Where:
- `RequestSchema`: The schema that defines the structure of the incoming request
- `handlerFunction`: A function that processes the request and returns the appropriate response

### Implemented Request Handlers

#### Resources

Resources are static or dynamically generated content that models can access for context or information retrieval.

```typescript
// List all available resources
server.setRequestHandler(
  ListResourcesRequestSchema, 
  () => ({ resources })
);

// Retrieve a specific resource by URI
server.setRequestHandler(ReadResourceRequestSchema, (request) => {
  const { uri } = request.params ?? {};
  // Check if this is a static resource
  const resourceHandler = resourceHandlers[uri as keyof typeof resourceHandlers];
  if (resourceHandler) return resourceHandler();
  
  // Check if this is a generated resource from a template
  const resourceTemplateHandler = getResourceTemplate(uri);
  if (resourceTemplateHandler) return resourceTemplateHandler();
  
  throw new Error("Resource not found");
});
```

The resource handler first checks if the requested URI matches a static resource. If no match is found, it checks if the URI matches a resource template pattern. This dual approach allows for both static and dynamically generated resources.

#### Resource Templates

Resource templates allow for dynamic generation of resources based on patterns in the URI:

```typescript
// List all available resource templates
server.setRequestHandler(ListResourceTemplatesRequestSchema, () => ({
  resourceTemplates,
}));
```

When a resource is requested that matches a template pattern (e.g., "greetings://John"), the server uses the pattern to extract parameters and generate a custom resource.

#### Tools

Tools are functions that models can call to perform actions or computations:

```typescript
// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.values(tools),
}));

// Call a specific tool with parameters
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  type ToolHandlerKey = keyof typeof toolHandlers;
  const { name, arguments: params } = request.params ?? {};
  const handler = toolHandlers[name as ToolHandlerKey];

  if (!handler) throw new Error("Tool not found");

  type HandlerParams = Parameters<typeof handler>;
  return handler(...[params] as HandlerParams);
});
```

The tool handler retrieves the appropriate function based on the tool name and passes the provided parameters to it. The tools are strongly typed to ensure proper usage.

#### Prompts

Prompts guide model behavior for specific tasks:

```typescript
// List all available prompts
server.setRequestHandler(ListPromptsRequestSchema, () => ({
  prompts: Object.values(prompts),
}));

// Get a specific prompt with parameters
server.setRequestHandler(GetPromptRequestSchema, (request) => {
  const { name, arguments: args } = request.params;
  const promptHandler = promptHandlers[name as keyof typeof promptHandlers];
  if (promptHandler) return promptHandler(args as { name: string, style?: string });
  throw new Error("Prompt not found");
});
```

The prompt handler retrieves and processes a prompt template, inserting the provided parameters.

## Components Structure

### Tools (`tools.ts`)

Tools allow models to perform actions through defined functions with specific parameters.

```typescript
// Example tool definition
export const tools = {
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
};

// Example tool handler implementation
export const toolHandlers = {
  "create-message": (args: CreateMessageArgs) => {
    if (!args.messageType) throw new Error("Must provide a message type.");
    if (!args.recipient) throw new Error("Must provide a recipient.");

    const { messageType, recipient } = args;
    const tone = args.tone || "casual";
    
    // Implementation details...
    
    return {
      content: [
        {
          type: "text",
          text: message,
        },
      ],
    };
  },
};
```

Each tool has:
- `name`: Unique identifier for the tool
- `description`: Human-readable description of what the tool does
- `inputSchema`: JSON Schema defining the expected parameters
- A handler function in `toolHandlers` that implements the tool's logic

### Resources (`resources.ts`)

Resources provide content and context for models to access.

```typescript
// Example resource metadata
export const resources = [
  {
    uri: "hello://world",
    name: "Hello World Message",
    description: "A simple greeting message",
    mimeType: "text/plain",
  },
];

// Example resource handler implementation
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
```

Each resource has:
- `uri`: Unique identifier for the resource
- `name`: Human-readable name
- `description`: Description of what the resource provides
- `mimeType`: The MIME type of the resource content
- A handler function in `resourceHandlers` that returns the resource content

### Resource Templates (`resource-templates.ts`)

Resource templates enable dynamic resource generation based on URI patterns.

```typescript
// Example resource template metadata
export const resourceTemplates = [
  {
    uriTemplate: "greetings://{name}",
    name: "Personal Greeting",
    description: "A personalized greeting message",
    mimeType: "text/plain",
  },
];

// Example resource template pattern and handler
const greetingExp = /^greetings:\/\/(.+)$/;

// Example resource template resolver
export const getResourceTemplate = (uri: string) => {
  const greetingMatch = uri.match(greetingExp);
  if (greetingMatch) {
    return () => ({
      contents: [
        {
          uri,
          text: `Hello, ${decodeURIComponent(greetingMatch[1])}! Welcome to MCP.`,
        },
      ],
    });
  }
};
```

Each resource template has:
- `uriTemplate`: Pattern that defines how to match and extract parameters from URIs
- `name`: Human-readable name
- `description`: Description of what the template generates
- `mimeType`: The MIME type of the generated resource
- A pattern matching function and handler that generates the resource content

### Prompts (`prompts.ts`)

Prompts provide guidance for model behavior with specific tasks.

```typescript
// Example prompt metadata
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

// Example prompt handler implementation
export const promptHandlers = {
  "create-greeting": ({ name, style = "casual" }: { name: string, style?: string }) => {
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
```

Each prompt has:
- `name`: Unique identifier for the prompt
- `description`: Human-readable description
- `arguments`: Schema of parameters the prompt accepts
- A handler function in `promptHandlers` that processes the prompt with parameters

## Debugging

The MCP Inspector helps you debug your server. When you run the server with `npm run start`, the Inspector provides a web interface at the URL indicated in the console output.

## Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/introduction)
- [MCP Typescript SDK](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file)
- [Building MCP Servers](https://medium.com/@cstroliadavis/building-mcp-servers-f9ce29814f1f) by Craig Strolia-Davis

## Credits

This project was created with guidance from Craig Strolia-Davis's article [Building MCP Servers](https://medium.com/@cstroliadavis/building-mcp-servers-f9ce29814f1f), which provides excellent insights into creating Model Context Protocol servers.