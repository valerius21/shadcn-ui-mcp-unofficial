import {axios} from './axios.js';
import * as cheerio from 'cheerio';
import { 
  ComponentExample, 
  ComponentInfo, 
  ComponentProp,
  Theme,
  Block
} from '../schemas/component.js';

const SHADCN_DOCS_URL = "https://ui.shadcn.com";
const SHADCN_GITHUB_URL = "https://github.com/shadcn-ui/ui";
const SHADCN_RAW_GITHUB_URL = "https://raw.githubusercontent.com/shadcn-ui/ui/main";

// Cache storage
const componentCache: Map<string, ComponentInfo> = new Map();
const examplesCache: Map<string, ComponentExample[]> = new Map();
const themesCache: Theme[] | null = null;
const blocksCache: Block[] | null = null;
let componentsListCache: ComponentInfo[] | null = null;

/**
 * Get demo for a component from a URL
 * @param name - Name of the component
 * @param url - URL to retrieve the component demo from
 * @returns A promise with the component info
 */
function getComponentDemo(name: string, url: string): Promise<ComponentInfo> {
    // Check if the URL is valid
    const urlPattern = /^(https?:\/\/)?([\w.-]+)([\/\w .-]*)*\/?$/;
    if (!urlPattern.test(url)) {
        throw new Error("Invalid URL");
    }

    // Check cache first
    if (componentCache.has(name)) {
        return Promise.resolve(componentCache.get(name)!);
    }

    return axios.github.get(url).then((res) => {
        // Parse the response using cheerio
        const $ = cheerio.load(res.data);
        
        // Extract component information
        const componentInfo = extractComponentInfo($, name, url);
        
        // Cache the result
        componentCache.set(name, componentInfo);
        
        return componentInfo;
    });
}

/**
 * Get all available ShadcnUI components
 * @returns Promise with an array of component info
 */
async function listComponents(): Promise<ComponentInfo[]> {
    if (componentsListCache) {
        return componentsListCache;
    }
    
    return axios.shadcn.get('/components').then((res) => {
        const $ = cheerio.load(res.data);
        const components: ComponentInfo[] = [];
        
        // Extract component links
        $("a").each((_, element) => {
            const link = $(element);
            const url = link.attr("href");
            
            if (url && url.startsWith("/docs/components/")) {
                const name = url.split("/").pop() || "";
                
                components.push({
                    name,
                    description: "", // Will be populated when fetching details
                    url: `${SHADCN_DOCS_URL}${url}`,
                });
            }
        });
        
        componentsListCache = components;
        return components;
    });
}

/**
 * Get detailed information about a specific component
 * @param componentName Name of the component to fetch
 * @returns Promise with component information
 */
async function getComponentDetails(componentName: string): Promise<ComponentInfo> {
    // Check cache first
    if (componentCache.has(componentName)) {
        return componentCache.get(componentName)!;
    }
    
    return axios.shadcn.get(`/components/${componentName}`).then((res) => {
        const $ = cheerio.load(res.data);
        
        // Extract component information
        const componentInfo = extractComponentInfo($, componentName);
        
        // Cache the result
        componentCache.set(componentName, componentInfo);
        
        return componentInfo;
    });
}

/**
 * Extract component information from HTML
 * @param $ Cheerio instance
 * @param componentName Name of the component
 * @param url Optional URL of the component
 * @returns Component information
 */
function extractComponentInfo($: cheerio.CheerioAPI, componentName: string, url?: string): ComponentInfo {
    // Extract title
    const title = $("h1").first().text().trim();
    
    // Extract description
    const description = extractDescription($);
    
    // Extract GitHub source code link
    const sourceUrl = `${SHADCN_GITHUB_URL}/tree/main/apps/www/registry/default/ui/${componentName}`;
    
    // Extract installation instructions
    const installation = extractInstallation($);
    
    // Extract usage examples
    const usage = extractUsage($);
    
    // Extract variant information
    const props = extractVariants($, componentName);
    
    return {
        name: componentName,
        description,
        url: url || `${SHADCN_DOCS_URL}/docs/components/${componentName}`,
        sourceUrl,
        installation: installation.trim(),
        usage: usage.trim(),
        props: Object.keys(props).length > 0 ? props : undefined,
    };
}

/**
 * Extracts component description from the page
 * @param $ Cheerio instance
 * @returns Extracted description
 */
function extractDescription($: cheerio.CheerioAPI): string {
    let description = "";
    const descriptionElement = $("h1").first().next("p");
    if (descriptionElement.length > 0) {
        // Get only text content, removing any JavaScript code
        const clonedElement = descriptionElement.clone();
        clonedElement.find("script").remove();
        description = clonedElement.text().trim();
    }
    return description;
}

/**
 * Extracts installation instructions from the page
 * @param $ Cheerio instance
 * @returns Installation instructions
 */
function extractInstallation($: cheerio.CheerioAPI): string {
    let installation = "";
    const installSection = $("h2").filter((_, el) => $(el).text().trim() === "Installation");
    if (installSection.length > 0) {
        // Find installation command
        const codeBlock = installSection.nextAll("pre").first();
        if (codeBlock.length > 0) {
            installation = codeBlock.text().trim();
        }
    }
    return installation;
}

/**
 * Extracts usage examples from the page
 * @param $ Cheerio instance
 * @returns Usage examples
 */
function extractUsage($: cheerio.CheerioAPI): string {
    let usage = "";
    const usageSection = $("h2").filter((_, el) => $(el).text().trim() === "Usage");
    if (usageSection.length > 0) {
        const codeBlocks = usageSection.nextAll("pre");
        if (codeBlocks.length > 0) {
            codeBlocks.each((_, el) => {
                usage += $(el).text().trim() + "\n\n";
            });
        }
    }
    return usage;
}

/**
 * Extracts variant information from the page
 * @param $ Cheerio instance
 * @param componentName Name of the component
 * @returns Object containing variant properties
 */
function extractVariants($: cheerio.CheerioAPI, componentName: string): Record<string, ComponentProp> {
    const props: Record<string, ComponentProp> = {};
    
    // Extract variants from Examples section
    const examplesSection = $("h2").filter((_, el) => $(el).text().trim() === "Examples");
    if (examplesSection.length > 0) {
        // Find each variant
        const variantHeadings = examplesSection.nextAll("h3");
        
        variantHeadings.each((_, heading) => {
            const variantName = $(heading).text().trim();
            
            // Get variant code example
            let codeExample = "";
            
            // Find Code tab
            const codeTab = $(heading).nextAll(".tabs-content").first();
            if (codeTab.length > 0) {
                const codeBlock = codeTab.find("pre");
                if (codeBlock.length > 0) {
                    codeExample = codeBlock.text().trim();
                }
            }
            
            props[variantName] = {
                type: "variant",
                description: `${variantName} variant of the ${componentName} component`,
                required: false,
                example: codeExample
            };
        });
    }
    
    return props;
}

/**
 * Get usage examples for a specific component
 * @param componentName Name of the component
 * @returns Promise with component examples
 */
async function getComponentExamples(componentName: string): Promise<ComponentExample[]> {
    return axios.shadcn.get(`/components/${componentName}`).then(async (res) => {
        const $ = cheerio.load(res.data);
        
        const examples: ComponentExample[] = [];
        
        // Collect examples from different sources
        collectGeneralCodeExamples($, examples);
        collectSectionExamples($, "Usage", "Basic usage example", examples);
        collectSectionExamples($, "Link", "Link usage example", examples);
        await collectGitHubExamples(componentName, examples);
        
        return examples;
    });
}

/**
 * Collects general code examples from the page
 * @param $ Cheerio instance
 * @param examples Array to add examples to
 */
function collectGeneralCodeExamples($: cheerio.CheerioAPI, examples: ComponentExample[]): void {
    const codeBlocks = $("pre");
    codeBlocks.each((i, el) => {
        const code = $(el).text().trim();
        if (code) {
            // Find heading before code block
            let title = "Code Example " + (i + 1);
            let description = "Code example";
            
            // Look for headings
            let prevElement = $(el).prev();
            while (prevElement.length && !prevElement.is("h1") && !prevElement.is("h2") && !prevElement.is("h3")) {
                prevElement = prevElement.prev();
            }
            
            if (prevElement.is("h2") || prevElement.is("h3")) {
                title = prevElement.text().trim();
                description = `${title} example`;
            }
            
            examples.push({
                title,
                code,
                description
            });
        }
    });
}

/**
 * Collects examples from a specific section
 * @param $ Cheerio instance
 * @param sectionName Name of the section to collect from
 * @param descriptionPrefix Prefix for the description
 * @param examples Array to add examples to
 */
function collectSectionExamples(
    $: cheerio.CheerioAPI, 
    sectionName: string, 
    descriptionPrefix: string,
    examples: ComponentExample[]
): void {
    const section = $("h2").filter((_, el) => $(el).text().trim() === sectionName);
    if (section.length > 0) {
        const codeBlocks = section.nextAll("pre");
        codeBlocks.each((i, el) => {
            const code = $(el).text().trim();
            if (code) {
                examples.push({
                    title: `${sectionName} Example ${i + 1}`,
                    code: code,
                    description: descriptionPrefix
                });
            }
        });
    }
}

/**
 * Collects examples from GitHub repository
 * @param componentName Name of the component
 * @param examples Array to add examples to
 */
async function collectGitHubExamples(componentName: string, examples: ComponentExample[]): Promise<void> {
    try {
        const githubResponse = await axios.github.get(
            `apps/www/registry/default/example/${componentName}-demo.tsx`
        );
        
        if (githubResponse.status === 200) {
            examples.push({
                title: "GitHub Demo Example",
                code: githubResponse.data,
            });
        }
    } catch (error) {
        // Continue even if GitHub fetch fails
        console.error(`Failed to fetch GitHub example for ${componentName}:`, error);
    }
}

/**
 * Search for components by query string
 * @param query Search query
 * @returns Promise with filtered components
 */
async function searchComponents(query: string): Promise<ComponentInfo[]> {
    // Ensure components list is loaded
    if (!componentsListCache) {
        await listComponents();
    }
    
    if (!componentsListCache) {
        return [];
    }
    
    // Filter components matching the search query
    return componentsListCache.filter(component => {
        return (
            component.name.includes(query) ||
            component.description.toLowerCase().includes(query)
        );
    });
}

/**
 * Get usage instructions for a specific component
 * @param componentName Name of the component
 * @returns Promise with usage instructions
 */
async function getComponentUsage(componentName: string): Promise<string> {
  // Try to get from cache first
  if (componentCache.has(componentName)) {
    const cachedComponent = componentCache.get(componentName)!;
    if (cachedComponent.usage) {
      return cachedComponent.usage;
    }
  }
  
  // If not in cache, fetch full component details
  const componentInfo = await getComponentDetails(componentName);
  return componentInfo.usage || "No usage instructions available for this component.";
}

/**
 * Get available themes for shadcn/ui
 * @param query Optional query to filter themes
 * @returns Promise with list of themes
 */
async function getThemes(query?: string): Promise<Theme[]> {
  if (themesCache) {
    return filterThemes(themesCache, query);
  }
  
  try {
    // Fetch themes from shadcn/ui docs
    const response = await axios.shadcn.get('/themes');
    const $ = cheerio.load(response.data);
    
    const themes: Theme[] = [];
    
    // Extract theme cards/sections
    $('.grid-cols-1').each((_, el) => {
      const themeCard = $(el);
      const nameEl = themeCard.find('h3').first();
      const name = nameEl.text().trim();
      
      if (name) {
        const descriptionEl = nameEl.next('p');
        const description = descriptionEl.text().trim();
        
        // Find preview image if available
        const imgEl = themeCard.find('img');
        const preview = imgEl.attr('src') || undefined;
        
        // Find author info if available
        const authorEl = themeCard.find('a[href^="https://github.com/"]');
        const author = authorEl.text().trim() || undefined;
        
        themes.push({
          name,
          description,
          url: `${SHADCN_DOCS_URL}/themes#${name.toLowerCase().replace(/\s+/g, '-')}`,
          preview,
          author
        });
      }
    });
    
    return filterThemes(themes, query);
    
  } catch (error) {
    console.error("Error fetching themes:", error);
    return [];
  }
}

/**
 * Filter themes by query
 * @param themes List of themes to filter
 * @param query Optional search query
 * @returns Filtered themes
 */
function filterThemes(themes: Theme[], query?: string): Theme[] {
  if (!query) {
    return themes;
  }
  
  const lowerQuery = query.toLowerCase();
  
  return themes.filter(theme => 
    theme.name.toLowerCase().includes(lowerQuery) ||
    theme.description.toLowerCase().includes(lowerQuery) ||
    (theme.author && theme.author.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get reusable UI blocks/patterns from shadcn/ui
 * @param query Optional query to filter blocks
 * @param category Optional category to filter blocks
 * @returns Promise with list of blocks
 */
async function getBlocks(query?: string, category?: string): Promise<Block[]> {
  if (blocksCache) {
    return filterBlocks(blocksCache, query, category);
  }
  
  try {
    // Fetch blocks from shadcn/ui docs or GitHub
    const response = await axios.github.get('apps/www/registry/default/example/');
    
    // For simplicity, we're assuming the response includes a directory listing
    const blocks: Block[] = [];
    
    // Parse the GitHub directory response
    const $ = cheerio.load(response.data);
    
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      
      // Find .tsx files that are examples
      if (href && href.endsWith('.tsx')) {
        const name = href.replace('.tsx', '').replace(/-/g, ' ');
        
        blocks.push({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          description: `UI block for ${name}`,
          code: `// Code will be fetched when block is requested`,
          dependencies: []
        });
      }
    });
    
    return filterBlocks(blocks, query, category);
    
  } catch (error) {
    console.error("Error fetching blocks:", error);
    return [];
  }
}

/**
 * Get full code for a specific block
 * @param blockName Name of the block to fetch
 * @returns Promise with the block including full code
 */
async function getBlockDetails(blockName: string): Promise<Block | null> {
  try {
    const formattedName = blockName.toLowerCase().replace(/\s+/g, '-');
    const response = await axios.github.get(`apps/www/registry/default/example/${formattedName}.tsx`);
    
    if (response.status === 200) {
      return {
        name: blockName,
        description: `UI block for ${blockName}`,
        code: response.data,
        dependencies: extractDependencies(response.data)
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching block details for ${blockName}:`, error);
    return null;
  }
}

/**
 * Extract dependencies from code
 * @param code Code to extract dependencies from
 * @returns Array of dependencies
 */
function extractDependencies(code: string): string[] {
  const dependencies: string[] = [];
  
  // Extract import statements
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(code)) !== null) {
    const importPath = match[2];
    if (!importPath.startsWith('.')) {
      dependencies.push(importPath);
    }
  }
  
  return [...new Set(dependencies)]; // Remove duplicates
}

/**
 * Filter blocks by query and category
 * @param blocks List of blocks to filter
 * @param query Optional search query
 * @param category Optional category
 * @returns Filtered blocks
 */
function filterBlocks(blocks: Block[], query?: string, category?: string): Block[] {
  let filtered = [...blocks];
  
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(block => 
      block.name.toLowerCase().includes(lowerQuery) ||
      block.description.toLowerCase().includes(lowerQuery)
    );
  }
  
  if (category) {
    const lowerCategory = category.toLowerCase();
    filtered = filtered.filter(block => 
      block.name.toLowerCase().includes(lowerCategory) ||
      block.dependencies!.some(dep => dep.toLowerCase().includes(lowerCategory))
    );
  }
  
  return filtered;
}

/**
 * Get component installation and configuration details
 * @param componentName Name of the component
 * @returns Promise with installation and configuration details
 */
async function getComponentConfig(componentName: string): Promise<any> {
  // Try to get from cache first
  if (componentCache.has(componentName)) {
    const cachedComponent = componentCache.get(componentName)!;
    if (cachedComponent.installation) {
      return {
        installation: cachedComponent.installation,
        config: extractConfigFromUsage(cachedComponent.usage || ""),
        hooks: extractHooksFromUsage(cachedComponent.usage || "")
      };
    }
  }
  
  // If not in cache, fetch full component details
  const componentInfo = await getComponentDetails(componentName);
  
  return {
    installation: componentInfo.installation || "No installation instructions available.",
    config: extractConfigFromUsage(componentInfo.usage || ""),
    hooks: extractHooksFromUsage(componentInfo.usage || "")
  };
}

/**
 * Extract configuration code from usage instructions
 * @param usage Usage instructions
 * @returns Configuration code
 */
function extractConfigFromUsage(usage: string): string {
  // Look for configuration code in usage instructions
  const configRegex = /```(?:js|jsx|ts|tsx)[\s\S]*?(const\s+config[\s\S]*?)```/;
  const match = usage.match(configRegex);
  
  if (match && match[1]) {
    return match[1].trim();
  }
  
  return "No configuration code found in usage instructions.";
}

/**
 * Extract hooks from usage instructions
 * @param usage Usage instructions
 * @returns Hooks code
 */
function extractHooksFromUsage(usage: string): string[] {
  const hooks: string[] = [];
  
  // Look for hooks in usage instructions
  const hooksRegex = /use[A-Z][a-zA-Z]*/g;
  let match;
  
  while ((match = hooksRegex.exec(usage)) !== null) {
    hooks.push(match[0]);
  }
  
  return [...new Set(hooks)]; // Remove duplicates
}

/**
 * Get documentation for a specific component or topic
 * @param topic Topic or component name
 * @returns Promise with documentation content
 */
async function getDocs(topic: string): Promise<string> {
  try {
    const formattedTopic = topic.toLowerCase().replace(/\s+/g, '-');
    let response;
    
    try {
      // Try to fetch from component docs first
      response = await axios.shadcn.get(`/components/${formattedTopic}`);
    } catch (error) {
      // If not found, try general docs
      response = await axios.shadcn.get(`/${formattedTopic}`);
    }
    
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      
      // Get the main content section
      const content = $('.mdx').text();
      return content || "No documentation content found.";
    }
    
    return "Documentation not found.";
  } catch (error) {
    console.error(`Error fetching documentation for ${topic}:`, error);
    return "Error fetching documentation.";
  }
}

export {
    getComponentDemo,
    listComponents,
    getComponentDetails,
    getComponentExamples,
    searchComponents,
    getComponentUsage,
    getThemes,
    getBlocks,
    getBlockDetails,
    getComponentConfig,
    getDocs
};

