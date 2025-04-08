import { z } from 'zod';

// Schema for component property information
export const ComponentPropSchema = z.object({
  type: z.string(),
  description: z.string(),
  required: z.boolean(),
  default: z.string().optional(),
  example: z.string().optional(),
});

// Schema for component example
export const ComponentExampleSchema = z.object({
  title: z.string(),
  code: z.string(),
  description: z.string().optional(),
});

// Schema for component information
export const ComponentInfoSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string(),
  sourceUrl: z.string().optional(),
  apiReference: z.string().optional(),
  installation: z.string().optional(),
  usage: z.string().optional(),
  props: z.record(z.string(), ComponentPropSchema).optional(),
  examples: z.array(ComponentExampleSchema).optional(),
});

// Schema for theme information
export const ThemeSchema = z.object({
  name: z.string(),
  description: z.string(),
  url: z.string(),
  preview: z.string().optional(),
  author: z.string().optional(),
});

// Schema for block information (reusable UI blocks)
export const BlockSchema = z.object({
  name: z.string(),
  description: z.string(),
  code: z.string(),
  preview: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
});

// Input schema for the get_component tool
export const GetComponentSchema = z.object({
  componentName: z.string().describe('Name of the shadcn/ui component (e.g., "accordion", "button")'),
});

// Input schema for the get_examples tool
export const GetExamplesSchema = z.object({
  componentName: z.string().describe('Name of the shadcn/ui component (e.g., "accordion", "button")'),
});

// Input schema for the get_usage tool
export const GetUsageSchema = z.object({
  componentName: z.string().describe('Name of the shadcn/ui component (e.g., "accordion", "button")'),
});

// Input schema for the search tool
export const SearchQuerySchema = z.object({
  query: z.string().describe('Search query to find relevant components'),
});

// Input schema for the get_themes tool
export const GetThemesSchema = z.object({
  query: z.string().optional().describe('Optional search query to filter themes'),
});

// Input schema for the get_blocks tool
export const GetBlocksSchema = z.object({
  query: z.string().optional().describe('Optional search query to filter blocks'),
  category: z.string().optional().describe('Category of blocks to filter by'),
});

// Export types inferred from schemas
export type ComponentProp = z.infer<typeof ComponentPropSchema>;
export type ComponentExample = z.infer<typeof ComponentExampleSchema>;
export type ComponentInfo = z.infer<typeof ComponentInfoSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Block = z.infer<typeof BlockSchema>;

// Export types for tool parameters
export type GetComponentParams = z.infer<typeof GetComponentSchema>;
export type GetExamplesParams = z.infer<typeof GetExamplesSchema>;
export type GetUsageParams = z.infer<typeof GetUsageSchema>;
export type SearchQueryParams = z.infer<typeof SearchQuerySchema>;
export type GetThemesParams = z.infer<typeof GetThemesSchema>;
export type GetBlocksParams = z.infer<typeof GetBlocksSchema>;