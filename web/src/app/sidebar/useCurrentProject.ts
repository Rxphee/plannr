import { usePathname } from "next/navigation";

// The project whose pages are open, found by the key in the path
export function useCurrentProject<Project extends { key: string }>(projects: Project[]): Project | undefined {
    const pathname = usePathname();
    const key = /^\/projects\/([^/]+)/.exec(pathname)?.[1];
    return projects.find((project) => project.key === key);
}
