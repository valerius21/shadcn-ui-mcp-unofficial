/**
 * Resources implementation for the Model Context Protocol (MCP) server.
 * 
 * This file defines the resources that can be returned by the server based on client requests.
 * Resources are static content or dynamically generated content referenced by URIs.
 */

import { getDocs } from './utils/api.js';

/**
 * Resource definitions exported to the MCP handler
 * Each resource has a name, description, uri and contentType
 */
export const resources = {
  'shadcn-ui-overview': {
    name: 'shadcn-ui-overview',
    description: 'Overview of shadcn/ui component library',
    uri: 'resource:shadcn-ui-overview',
    contentType: 'text/plain',
  },
  'shadcn-ui-installation': {
    name: 'shadcn-ui-installation',
    description: 'Installation instructions for shadcn/ui',
    uri: 'resource:shadcn-ui-installation',
    contentType: 'text/plain',
  },
  'shadcn-ui-component-list': {
    name: 'shadcn-ui-component-list',
    description: 'List of available shadcn/ui components',
    uri: 'resource:shadcn-ui-component-list',
    contentType: 'text/plain',
  },
  'shadcn-ui-theming': {
    name: 'shadcn-ui-theming',
    description: 'Theming information for shadcn/ui',
    uri: 'resource:shadcn-ui-theming',
    contentType: 'text/plain',
  },
};

/**
 * Handler for the shadcn-ui-overview resource
 * @returns Overview content for shadcn/ui
 */
const getShadcnUiOverview = async () => {
  const overviewContent = await getDocs('getting-started');
  
  return {
    content: overviewContent || `
    shadcn/ui is a collection of reusable components built using Radix UI and Tailwind CSS.
    
    It's not a component library, but rather a collection of re-usable components that you can copy and paste into your apps.
    
    The components are accessible, customizable, and open source.
    
    To learn more, visit https://ui.shadcn.com/
    `,
    contentType: 'text/plain',
  };
};

/**
 * Handler for the shadcn-ui-installation resource
 * @returns Installation instructions for shadcn/ui
 */
const getShadcnUiInstallation = async () => {
  const installationContent = await getDocs('installation');
  
  return {
    content: installationContent || `
    Installation instructions for shadcn/ui:
    
    1. Create a new project (e.g., Next.js, Vite, etc.)
    2. Initialize shadcn/ui:
       npx shadcn-ui@latest init
    3. Answer the prompts for your project configuration
    4. Install components as needed:
       npx shadcn-ui@latest add button
    
    For more details, visit https://ui.shadcn.com/docs/installation
    `,
    contentType: 'text/plain',
  };
};

/**
 * Handler for the shadcn-ui-component-list resource
 * @returns List of shadcn/ui components
 */
const getShadcnUiComponentList = async () => {
  return {
    content: `
    Available shadcn/ui components:
    
    - Accordion
    - Alert
    - Alert Dialog
    - Aspect Ratio
    - Avatar
    - Badge
    - Button
    - Calendar
    - Card
    - Carousel
    - Checkbox
    - Collapsible
    - Command
    - Context Menu
    - Data Table
    - Date Picker
    - Dialog
    - Drawer
    - Dropdown Menu
    - Form
    - Hover Card
    - Input
    - Label
    - Menubar
    - Navigation Menu
    - Pagination
    - Popover
    - Progress
    - Radio Group
    - Scroll Area
    - Select
    - Separator
    - Sheet
    - Skeleton
    - Slider
    - Switch
    - Table
    - Tabs
    - Textarea
    - Toast
    - Toggle
    - Toggle Group
    - Tooltip
    
    For details on each component, use the get_component_details tool.
    `,
    contentType: 'text/plain',
  };
};

/**
 * Handler for the shadcn-ui-theming resource
 * @returns Theming information for shadcn/ui
 */
const getShadcnUiTheming = async () => {
  const themingContent = await getDocs('theming');
  
  return {
    content: themingContent || `
    Theming in shadcn/ui:
    
    shadcn/ui components use CSS variables for theming. You can customize the theme by:
    
    1. Editing the CSS variables in your globals.css file
    2. Using the provided themes or creating custom themes
    3. Using the Dark Mode feature
    
    The default theme includes light and dark modes.
    
    For more details on theming, visit https://ui.shadcn.com/docs/theming
    `,
    contentType: 'text/plain',
  };
};

/**
 * Map of resource URIs to their handler functions
 * Each handler function returns the resource content when requested
 */
export const resourceHandlers = {
  'resource:shadcn-ui-overview': getShadcnUiOverview,
  'resource:shadcn-ui-installation': getShadcnUiInstallation,
  'resource:shadcn-ui-component-list': getShadcnUiComponentList,
  'resource:shadcn-ui-theming': getShadcnUiTheming,
};