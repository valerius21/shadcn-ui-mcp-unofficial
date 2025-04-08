[]-tools
    []-get_component
        - calls the github axios endpoint by postfixing the /ui path followed by /${component_name}.tsx to fetch tsx code for the component,this helps gain context about the actual component
    []-get_component_demo
        - calls the github axios endpoint by postfixing the /components path followed by /${component_name}demo.tsx to fetch tsx code illustrating how the component should be used

[]-resource_templates
    []-get_install_script_for_component
        -uri takes in 2 dynamic values,
            1.the package manager to be used
            2.the component to be installed
        and returns a working script that when executed installs the component
        for example: "pnpm dlx shadcn@latest add accordion","npx shadcn@latest add breadcrumb","bunx --bun shadcn@latest add button"
    []-get_installation_guide
        -uri takes in 2 dynamic values,
            1.the framework
            2.the package manager to be used
        and returns steps on how to proceed with installation with the specifed framework,this will be hardcoded later

[]-resources
    []-get_components
        -returns a list of available components that can be used in the project
