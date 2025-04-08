# Shadcn UI MCP Server

A TypeScript implementation of a Model Context Protocol (MCP) server that helps AI assistants access and work with shadcn/ui components. This server acts as a bridge between AI models like Claude and shadcn/ui, enabling assistants to fetch component source code, demos, and installation guides.

## Project Overview

This MCP server provides tools and resources to help AI assistants:
- Get shadcn/ui component source code
- Get component demo code and usage examples
- Generate installation instructions for shadcn/ui components
- Provide framework-specific installation guides

## Project Structure

```

shadcn-ui-mcp-unofficial/
├── build/             # Compiled JavaScript files
├── src/               # TypeScript source files
│   ├── index.ts       # Server entry point
│   ├── handler.ts     # Request handlers implementation
│   ├── tools.ts       # Tool definitions for component retrieval
│   ├── resources.ts   # Resource definitions for component listing
│   ├── resource-templates.ts # Templates for installation guides
│   ├── prompts.ts     # Prompt definitions
│   ├── schemas/       # JSON schemas for validation
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Utility functions and API clients
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

## Features

### Tools

This MCP server implements the following tools:

#### 1. `get_component`

Retrieves the source code of a shadcn/ui component.

- **Parameters**:
  - `componentName` (string): Name of the shadcn/ui component (e.g., "accordion", "button")
- **Returns**: The source code of the requested component

#### 2. `get_component_demo`

Retrieves demo code that illustrates how to use a shadcn/ui component.

- **Parameters**:
  - `componentName` (string): Name of the shadcn/ui component (e.g., "accordion", "button")
- **Returns**: Demo code showing how to use the component

### Resources

This MCP server provides the following resources:

#### 1. `resource:get_components`

Returns a list of all available shadcn/ui components that can be used.

### Resource Templates

This MCP server implements the following resource templates:

#### 1. `resource-template:get_install_script_for_component`

Generates a component installation script based on package manager preference.

- **Parameters**:
  - `packageManager` (string): The package manager to use (npm, pnpm, yarn, bun)
  - `component` (string): The component to install

#### 2. `resource-template:get_installation_guide`

Provides framework-specific installation guides for shadcn/ui.

- **Parameters**:
  - `framework` (string): The framework to use (next, vite, remix, etc.)
  - `packageManager` (string): The package manager to use (npm, pnpm, yarn, bun)


## Implementation Details

### GitHub Integration

The server fetches component information directly from the shadcn/ui GitHub repository, specifically from:
- The main shadcn-ui/ui repository
- The v4 application which contains the latest components

The server attempts multiple paths when looking for components, as some components are directly named (e.g., `button.tsx`) while others might be in a directory structure (e.g., `accordion/accordion.tsx`).

### Error Handling

The server implements robust error handling to handle cases where:
- Components don't exist or have been renamed
- Network requests to GitHub fail
- Invalid parameters are provided

### Extensibility

The server is designed to be easily extensible:
- Add new tools by updating the `tools.ts` file
- Add new resources by updating the `resources.ts` file
- Add new resource templates by updating the `resource-templates.ts` file

## Debugging

The MCP Inspector helps you debug your server. When you run the server with `npm run start`, the Inspector provides a web interface at the URL indicated in the console output (typically http://127.0.0.1:6274).

## Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/introduction)
- [MCP Typescript SDK](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Building MCP Servers](https://medium.com/@cstroliadavis/building-mcp-servers-f9ce29814f1f) by Craig Strolia-Davis