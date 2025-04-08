interface ComponentInfo {
    name: string;
    description: string;
    url: string;
    sourceUrl?: string;
    apiReference?: string;
    installation?: string;
    usage?: string;
    props?: Record<string, ComponentProp>;
    examples?: ComponentExample[];
  }
  
  /**
   * Interface for component property information
   */
  interface ComponentProp {
    type: string;
    description: string;
    required: boolean;
    default?: string;
    example?: string;
  }
  
  /**
   * Interface for component example
   */
  interface ComponentExample {
    title: string;
    code: string;
    description?: string;
  }

  export type { ComponentInfo, ComponentProp, ComponentExample };