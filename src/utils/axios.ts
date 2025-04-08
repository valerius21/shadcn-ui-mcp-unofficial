import { Axios } from "axios";


const shadcn = new Axios({
    baseURL: "https://ui.shadcn.com/docs",
    headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; ShadcnUiMcpServer/0.1.0)",
    },
    timeout: 10000,
})
const githubDirectories=["/ui","/blocks","/charts","/hooks","/lib"]
const github = new Axios({
    baseURL: "https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4",
    headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; ShadcnUiMcpServer/0.1.0)",
    },
    timeout: 10000,
});

export const axios = {
    shadcn,
    github,
    githubDirectories
}